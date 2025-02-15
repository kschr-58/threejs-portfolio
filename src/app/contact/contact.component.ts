import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import DaoService from '../services/dao.service';
import ContactMessage from 'src/models/contact-message';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  public messageSent: boolean = false;
  public notificationMessage: string | null = null;

  constructor(private daoService: DaoService) {}

  public onSendMessage(messageForm: NgForm): void {
    this.messageSent = true;
    const formValues = messageForm.value;

    const message = new ContactMessage(formValues.name, formValues.email, formValues.message);

    this.daoService.sendPostRequest('/contact', message)
    .subscribe({
      next: res => this.notificationMessage = 'Your message has been sent. Thank you for reaching out!',
      error: err => this.notificationMessage = err.message
    });
  }
}
