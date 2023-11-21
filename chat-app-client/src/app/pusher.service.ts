import { Injectable } from '@angular/core';
import Pusher from "pusher-js";
@Injectable({
  providedIn: 'root'
})
export class PusherService {
  pusher: any;
  messagesChannel: any;
  constructor() {
    // replace xxxx's with your Pusher application key
    this.pusher = new Pusher('ba7f827ca85ec8a94cb5', {
      cluster: 'ap1'
    });
    this.messagesChannel = this.pusher.subscribe('private-messages');
   }
}
