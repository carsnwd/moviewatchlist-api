import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
  const mAuth = {
    verifyIdToken: jest.fn(),
  };
  return {
    credential: {
      cert: jest.fn(),
    },
    initializeApp: jest.fn(),
    auth: jest.fn(() => mAuth),
  };
});

describe('FirebaseService', () => {
  let service: FirebaseService;
  let configService: ConfigService;
  let mockAuth: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
    configService = module.get<ConfigService>(ConfigService);
    mockAuth = admin.auth();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should verify the token', async () => {
      const token = 'test-token';
      const decodedToken = { uid: 'test-uid' };
      mockAuth.verifyIdToken.mockResolvedValue(decodedToken);

      const result = await service.verifyToken(token);

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(decodedToken);
    });

    it('should throw an error if token verification fails', async () => {
      const token = 'test-token';
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken(token)).rejects.toThrow('Invalid token');
    });
  });
});