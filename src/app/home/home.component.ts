import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { PostcontentService } from '../service/postcontent.service';
import { DashboardService } from '../service/dashboard.service';

import { LoadingService } from '@swimlane/ngx-ui';
import { NotificationService } from '@swimlane/ngx-ui';
const localToken = localStorage.getItem('token')

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  chooseAll;
  toggleChk;
  content;
  arrPages: Observable<any[]>
  choosePage = false;
  showProgress = false;
  arrDayTime = [];
  arrImages = [];
  arrPosted = [];
  scheduled_publish_time: number;
  isVideo = false;
  attached_media;
  percentUploadImage: number;
  constructor(
    private _db: AngularFireDatabase,
    public _storage: AngularFireStorage,
    private _http: Http,
    private _postcontentservice: PostcontentService,
    private _dashboardservice: DashboardService,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.arrPages = this._db.list('postmypage/users/' + localToken + '/pages').valueChanges()
    // this.arrPages.subscribe(page => {
    //   page.forEach(element => {
    //     let access_token = element.access_token
    //     // this.arrDayTime[access_token] = undefined
    //   });
    // })
  }
  upload(image) {
    return new Promise((resolve, reject) => {
      let taskUpload = this._storage.upload('postmypage/' + 'huy' + '/' + new Date().getTime(), image).downloadURL().subscribe(urlImage => {
        resolve(urlImage)
      })
    })
  }
  async  uploadImages(images) {
    for (let image of images) {
      let img_url = await this.upload(image)
      this.arrImages.push(img_url)
    }
  }
  onFileSelected(event) {
    let reader = new FileReader();
    this.attached_media = [];
    let images = event.target.files
    if (images.length) {
      let isTypeVideo = images[0].type.indexOf('video') == 0
      if (isTypeVideo) {
        this.isVideo = true;
        this.arrImages = [];
        console.log('video')
      } else {
        this.isVideo = false
        // this.arrImages = []
      }
    } else {
      console.log('Không có file được chọn')
    }

    this.uploadImages(images)
    // for (var i = 0; i < images.length; i++) {
    //   this.showProgress = true;
    //   let image = {
    //     url: '',
    //     percent: '',
    //   }
    //   this.upload(images[i], (img) => {
    //     this.arrImages.push(img)
    //     if(this.arrImages.length == images.length){
    //       this.showProgress = false
    //     }
    //   })
    //   // let taskUpload = this._storage.upload('postmypage/' + localToken + '/' + new Date().getTime(), images[i])
    //   // taskUpload.percentageChanges().subscribe(percent => {
    //   //   this.percentUploadImage = Math.round(percent)
    //   // })

    //   // taskUpload.downloadURL().subscribe(urlImage => {
    //   //   this.arrImages.push(urlImage)
    //   //   if (this.arrImages.length == images.length) {
    //   //     this.showProgress = false
    //   //   }
    //   // })
    // }
  }

  alert(body) {
    this.notificationService.create({
      body: body,
      styleType: 'success',
      timeout: 4000,
      rateLimit: false
    })
  }
  removeImage(img) {
    let position = this.arrImages.indexOf(img)
    this.arrImages.splice(position, 1);
  }
  resetForm(form) {
    form.reset()
    this.arrImages = []
    this.arrDayTime = []
    this.isVideo = false;

  }
  onFormSubmit(form) {
    // Start datetime
    let formvalue = form.value
    if (formvalue['pickerAll'] != '|') {
      console.log('all')
      let timeAll = this._postcontentservice.getTime(form.value['pickerAll'])
      this.scheduled_publish_time = timeAll
    } else {
      console.log('Not All')
      Object.keys(formvalue).map(key => {
        let dash = 'datetimepicker-'
        let positionDash = key.indexOf('datetimepicker')
        if (positionDash != -1 && formvalue[key] != '|') {
          // console.log(form.value[key])
          var acc = key.slice(positionDash + dash.length)
          var huy = this._postcontentservice.getTime(form.value[key])
          this.arrDayTime[acc] = (huy)
        }
      })
    }
    // End datetime


    let isPageSelected = Object.values(form.value).indexOf(true)
    if (isPageSelected == -1) {
      console.log('Chưa chọn page')
      this.choosePage = true;
      this.alert('Chọn page muốn đăng')
    } else {
      let formvalue = form.value
      let content = formvalue.content
      if (content || this.arrImages) {
        this.loadingService.start()
        if (this.arrImages.length) {
          Object.keys(form.value).map(access_token => {
            if (formvalue[access_token] === true && access_token != 'chooseAll') {
              if (this.isVideo) {
                let contentVideo = {
                  video: this.arrImages[0],
                  title: formvalue.titleVideo,
                  description: content
                }
                this._postcontentservice.postVideo(this.arrDayTime[access_token], contentVideo, access_token, (err, res) => {
                  this._dashboardservice.getInfoPage(access_token, (err, info) => {
                    if (info) {
                      console.log(res)
                      this.arrPosted.push({ post_id: res.id, page_id: info.id, page_name: info.name })
                      this.loadingService.complete()
                      this.resetForm(form)
                    }
                  })
                })
              } else {
                let publish_time;
                this.scheduled_publish_time ? publish_time = this.scheduled_publish_time : publish_time = this.arrDayTime[access_token]
                this._postcontentservice.postImages(publish_time, content, this.arrImages, access_token, (err, res) => {
                  this._dashboardservice.getInfoPage(access_token, (err, info) => {
                    console.log(info)
                    if (info) {
                      this.arrPosted.push({ post_id: res.id, page_id: info.id, page_name: info.name })
                      this.loadingService.complete()
                      this.resetForm(form)
                    }
                  })
                })
              }

            }
          })
        } else {
          console.log('Post Text')
          Object.keys(formvalue).map(access_token => {
            if (formvalue[access_token] === true && access_token != 'chooseAll') {
              let publish_time;
              this.scheduled_publish_time ? publish_time = this.scheduled_publish_time : publish_time = this.arrDayTime[access_token]

              this._postcontentservice.postStatus(publish_time, content, access_token, (err, res) => {
                if (err) {
                  this.alert('Fail')
                  this.loadingService.complete()
                } else {
                  this._dashboardservice.getInfoPage(access_token, (err, info) => {
                    if (info) {
                      console.log(res)
                      this.arrPosted.push({ post_id: res.id, page_id: info.id, page_name: info.name })
                      this.loadingService.complete()
                      this.resetForm(form)
                    }
                  })
                }
              })
            }
          })
        }
      }
    }
  }
}