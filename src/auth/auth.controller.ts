import { FirebaseService } from '@/firebase/firebase.service';
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as FirebaseAdmin from 'firebase-admin';
import { FirebaseAuthGuard } from '@/auth/firebase-auth/firebase-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly firebaseService: FirebaseService) { }

    @Post('login')
    async login(@Body('token') token: string, @Res() res: Response) {
        try {
            const decodedToken = await this.firebaseService.verifyToken(token);
            res.status(200).json(decodedToken);
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    }

    @Post('logout')
    @UseGuards(FirebaseAuthGuard)
    async logout(@Req() req: Request, @Res() res: Response) {
        res.status(200).json({ message: 'Logout successful' });
    }

    @Post('register')
    async register(@Body('email') email: string, @Body('password') password: string, @Res() res: Response) {
        try {
            const user = await FirebaseAdmin.auth().createUser({
                email,
                password,
            });
            res.status(201).json({ message: 'User created', user });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}
