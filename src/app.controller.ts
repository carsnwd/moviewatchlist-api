import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseAuthGuard } from '@/auth/firebase-auth/firebase-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  
  @Get('/secret')
  @UseGuards(FirebaseAuthGuard)
  getSecretRoute(): string {
    return 'Secret!!!!';
  }
}
