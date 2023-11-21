import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import Pusher from "pusher-js";
import axios from 'axios';

interface Message {
  from: string;
  to: string;
  content: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  myID = Date.now().toString();
  isLogin = false;
  isChooseFriend = false;
  currentFriend: {
    id: string,
    name: string,
  } = {
      name: "",
      id: ""
    };
  message = "";
  listUser: {
    id: string,
    name: string,
  }[];

  listMessage: { [key: string]: Message[] } = {};
  curListMessage: Message[] = [];

  pusher: any;
  authChannel: any;
  messageChannel: any;
  myAccount: {} = {}
  private accessTokenKey = 'accessToken';

  constructor() {
    this.listUser = this.getListUser();

    this.pusher = new Pusher('ba7f827ca85ec8a94cb5', {
      cluster: 'ap1'
    });

    this.authChannel = this.pusher.subscribe('authChannel');

    this.authChannel.unbind("login");

    this.authChannel.bind("login", (data: {
      id: string,
      name: string,
    }) => {
      if (data.id.toString() !== this.myID.toString()) {
        this.listUser.push(data);
      }
    });
  }

  async login(event: Event) {
    event.preventDefault();
    let info = {
      name: this.message,
      id: this.myID
    }
    this.message = ''
    const response = await axios.post('http://localhost:3000/api/login', { info: info });

    if (response.status === 200) {
      this.isLogin = true;

      localStorage.setItem(this.accessTokenKey + this.myID, JSON.stringify(info));
      this.messageChannel = this.pusher.subscribe("recieveMessage");
      this.messageChannel.bind(this.myID, (data: Message) => {
        let newMessage = data

        if (!this.listMessage.hasOwnProperty(newMessage.from)) {
          this.listMessage[newMessage.from] = [];
        }
        this.listMessage[newMessage.from].push(newMessage);
        this.curListMessage = this.listMessage[newMessage.from];
      });
    } else {
      alert("Lỗi kết nối. Đăng nhập lại");
    }
  }

  getListUser(): { name: string, id: string }[] {
    let listUser: { name: string, id: string }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.includes("access")) {
        let value = localStorage.getItem(key);
        if (value !== null) {
          try {
            const jsonObject = JSON.parse(value);
            if (jsonObject.id !== this.myID) {
              listUser.push(jsonObject);
            }
          } catch (error) {
            console.error('Error parsing localStorage value:', error);
            // Handle any error that occurs while parsing the localStorage value
          }
        }
      }
    }

    return listUser;
  }

  chooseFriend(currentFriend: { name: string, id: string }) {
    this.isChooseFriend = true;
    this.currentFriend = currentFriend;

    if (!this.listMessage.hasOwnProperty(this.currentFriend.id)) {
      this.listMessage[this.currentFriend.id] = [];
    }

    this.curListMessage = this.listMessage[this.currentFriend.id];


  }

  listMessageKeys(): string[] {
    return Object.keys(this.listMessage);
  }

  changeInput(event: Event) {
    this.message = (event.target as HTMLInputElement).value;
  }

  async sendMessage() {
    const newMessage: Message = {
      from: this.myID,
      to: this.currentFriend.id,
      content: this.message
    };

    this.listMessage[this.currentFriend.id].push(newMessage);

    await axios.post('http://localhost:3000/api/sendMessage', { newMessage });

    this.message = "";
  }

}
