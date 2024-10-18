import { Injectable } from '@angular/core';
const SockJS = require('sockjs-client');
import Stomp from 'stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;

  constructor() {}

  connect(publicKey: string) {
    const socket = new SockJS('http://localhost:8080/ws'); 
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected: ' + frame);

      this.stompClient.subscribe(`/topic/wallet/${publicKey}`, (message: any) => {
        this.onMessageReceived(message);
      });
    });
  }


  sendMessage(destination: string, message: any) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(destination, {}, JSON.stringify(message));
    } else {
      console.error('Stomp client is not connected.');
    }
  }

  private onMessageReceived(message: any) {
    const payload = JSON.parse(message.body);
    console.log('Thông báo nhận được: ', payload);

  }


  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
      console.log('Disconnected');
    }
  }
}
