import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from '@/firebase/firebase.service';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    verifyToken: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnValue({
      headers: {
        authorization: 'Bearer mockToken',
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: FirebaseService, useValue: mockFirebaseService },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    firebaseService = module.get<FirebaseService>(FirebaseService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if token is valid', async () => {
    const mockDecodedToken = { uid: 'mockUid' };
    mockFirebaseService.verifyToken.mockResolvedValue(mockDecodedToken);

    const result = await guard.canActivate(mockExecutionContext as unknown as ExecutionContext);
    expect(result).toBe(true);
    expect(mockExecutionContext.getRequest().user).toEqual(mockDecodedToken);
    expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('mockToken');
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    mockExecutionContext.getRequest.mockReturnValueOnce({
      headers: {},
    });

    await expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    mockFirebaseService.verifyToken.mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(mockExecutionContext as unknown as ExecutionContext)).rejects.toThrow(UnauthorizedException);
    expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('mockToken');
  });
});