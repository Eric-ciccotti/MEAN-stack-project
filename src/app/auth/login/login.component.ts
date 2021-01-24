import { Component, OnInit } from '@angular/core';

//loaded par route donc pas besoin de la meta selector

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  spinnerLoading = false;
  constructor() { }

  ngOnInit(): void {
  }

}
