import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return {
      title: 'Halaman Utama',
      message: 'Selamat datang di aplikasi NestJS',
      data: {
        items: ['Item 1', 'Item 2', 'Item 3'],
      },
    };
  }
}
