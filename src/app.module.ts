import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TmdbService } from './tmdb/tmdb.service';
import { HttpModule } from '@nestjs/axios';
import { TmdbController } from './tmdb/tmdb.controller';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { WatchlistModule } from './watchlist/watchlist.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src'),
      exclude: ['/api*'],
    }),
    HttpModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    WatchlistModule,
    FirebaseModule,
  ],
  controllers: [TmdbController],
  providers: [TmdbService, FirebaseAuthGuard],
})
export class AppModule { }
