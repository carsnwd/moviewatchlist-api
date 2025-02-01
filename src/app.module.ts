import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TmdbService } from './tmdb/tmdb.service';
import { HttpModule } from '@nestjs/axios';
import { TmdbController } from './tmdb/tmdb.controller';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src'),
      exclude: ['/api*'],
    }),
    HttpModule
  ],
  controllers: [TmdbController],
  providers: [AppService, FirebaseService, TmdbService, FirebaseAuthGuard],
})
export class AppModule { }
