import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseService } from '@/firebase/firebase.service';
import * as admin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnValue({
    getUser: jest.fn(),
  }),
}));

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let firebaseService: FirebaseService;

  const mockFirebaseService = {
    verifyToken: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        headers: {
          authorization: 'Bearer mockToken',
        },
      }),
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
    const mockUser = { uid: 'mockUid', email: 'mock@example.com' };
    mockFirebaseService.verifyToken.mockResolvedValue(mockDecodedToken);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    jest.spyOn(admin.auth(), 'getUser').mockResolvedValue(mockUser);

    const result = await guard.canActivate(
      mockExecutionContext as unknown as ExecutionContext,
    );
    expect(result).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    expect(mockExecutionContext.switchToHttp().getRequest().user).toEqual(
      mockUser,
    );
    expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('mockToken');
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    mockExecutionContext.switchToHttp().getRequest.mockReturnValueOnce({
      headers: {},
    });

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    mockFirebaseService.verifyToken.mockRejectedValue(
      new Error('Invalid token'),
    );

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('mockToken');
  });

  it('should throw UnauthorizedException if user retrieval fails', async () => {
    const mockDecodedToken = { uid: 'mockUid' };
    mockFirebaseService.verifyToken.mockResolvedValue(mockDecodedToken);
    jest
      .spyOn(admin.auth(), 'getUser')
      .mockRejectedValue(new Error('User not found'));

    await expect(
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockFirebaseService.verifyToken).toHaveBeenCalledWith('mockToken');
  });

  it('should extract token from header correctly', () => {
    const request = {
      user: {} as UserRecord,
      headers: {
        authorization: 'Bearer testToken',
      },
    };
    const token = guard['extractTokenFromHeader'](request);
    expect(token).toBe('testToken');
  });

  it('should return null if no authorization header is present', () => {
    const request = {
      user: {} as UserRecord,
      headers: {},
    };
    const token = guard['extractTokenFromHeader'](request);
    expect(token).toBeNull();
  });

  it('should return null if authorization header does not start with Bearer', () => {
    const request = {
      headers: {
        user: {} as UserRecord,
        authorization: 'Basic testToken',
      },
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const token = guard['extractTokenFromHeader'](request);
    expect(token).toBeNull();
  });
});
