import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

//loaded par route donc pas besoin de la meta selector

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  spinnerLoading = false;
  constructor() { }

  onLogin(form: NgForm) {
    console.log(form.value);

  }

  ngOnInit(): void {
  }

}
