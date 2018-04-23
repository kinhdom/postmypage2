import { Component, OnInit } from '@angular/core';
import { PagesService } from '../service/pages.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { NotificationService } from '@swimlane/ngx-ui';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

const localToken = localStorage.getItem('token')

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.css']
})
export class PagesComponent implements OnInit {
  code;
  isAdd: boolean = false;
  constructor(
    private _pagesService: PagesService,
    private _db: AngularFireDatabase,
    private notificationService: NotificationService,
    private _router: Router,
    private _http: Http
  ) { }

  ngOnInit() {
    this._http.get('https://postpage.herokuapp.com/')
  }
  onFormSubmit(form) {
    let html = form.value.code
    if (html) {
      let htmltext = this._pagesService.html2text(html)
      // Tach Token
      let x = htmltext.indexOf('EAAAA')
      let token1 = htmltext.substr(x, 200)
      let y = token1.indexOf("\"")
      let access_token = token1.substr(0, y)
      console.log('token goc: ' + access_token)
      if (access_token) {
        this._pagesService.getAllPage(access_token, (data) => {
          this._db.list('postmypage/users/' + localToken).set('pages', data)
          this._db.list('postmypage/users/' + localToken).set('access_token', access_token)
          window.location.href = '/'
        })
        // this._pagesService.getAllPage(access_token).subscribe(arrPages => {
        //   this._db.list('postmypage/users/' + localToken).set('pages', arrPages)
        //   this._db.list('postmypage/users/' + localToken).set('access_token', access_token)
        //   window.location.href = '/'
        // })
      } else {
        console.log('Ko có accesstoken')
        alert('Code không hợp lệ, hãy nhớ đăng nhập facebook và làm lại theo hướng dẫn')
      }
    } else {
      alert('Hãy nhập mã code theo hướng dẫn trước khi submit')
    }
  }
}
