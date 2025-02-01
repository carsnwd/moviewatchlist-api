import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const mockAuth = {
    verifyIdToken: jest.fn(),
  };
  return {
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    auth: jest.fn(() => mockAuth),
  };
});

describe('FirebaseService', () => {
  let service: FirebaseService;
  let mockAuth: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
    mockAuth = admin.auth();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Firebase Admin SDK', () => {
    expect(admin.initializeApp).toHaveBeenCalled();
    expect(admin.credential.cert).toHaveBeenCalledWith({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
  });

  it('should verify token', async () => {
    const mockToken = 'mockToken';
    const mockDecodedToken = { uid: 'mockUid' };
    mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

    const result = await service.verifyToken(mockToken);
    expect(result).toEqual(mockDecodedToken);
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(mockToken);
  });

  it('should throw an error if token verification fails', async () => {
    const mockToken = 'mockToken';
    mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

    await expect(service.verifyToken(mockToken)).rejects.toThrow('Invalid token');
    expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(mockToken);
  });
});