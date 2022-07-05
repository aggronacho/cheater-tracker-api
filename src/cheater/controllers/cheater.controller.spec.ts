import { of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { CheaterController } from './cheater.controller';
import { CheaterService } from '../services/cheater.service';

describe('CheaterController', () => {
  let createClan;
  let createAlias;
  let getCheaters;
  let createCheater;
  let deleteCheater;
  let getCheaterById;
  let controller: CheaterController;
  let cheaterService: CheaterService;

  beforeEach(async () => {
    createClan = jest.fn().mockResolvedValue('createdClan');
    createAlias = jest.fn().mockResolvedValue('createdAlias');
    getCheaters = jest.fn().mockResolvedValue(['cheater1', 'cheater2']);
    createCheater = jest.fn().mockResolvedValue('sample data');
    deleteCheater = jest.fn().mockResolvedValue({ affected: 1 });
    getCheaterById = jest.fn().mockResolvedValue('sample cheater');
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheaterController],
      providers: [
        {
          provide: CheaterService,
          useValue: {
            createClan,
            createAlias,
            getCheaters,
            createCheater,
            deleteCheater,
            getCheaterById,
          },
        },
      ],
    }).compile();

    controller = module.get<CheaterController>(CheaterController);
    cheaterService = module.get<CheaterService>(CheaterService);
  });

  describe('getUserProfile', () => {
    it('Should get user profile', async () => {
      cheaterService.getUserProfile = jest
        .fn()
        .mockImplementation(() => of({ data: 'sampleData' }));

      const response = await controller.getUserProfile({
        platform: 'uplay',
        username: 'sampleUser',
      });

      expect(response).toEqual('sampleData');
      expect(cheaterService.getUserProfile).toHaveBeenCalledWith({
        platform: 'uplay',
        username: 'sampleUser',
      });
    });

    it('Should throw an error getting user profile', () => {
      cheaterService.getUserProfile = jest
        .fn()
        .mockImplementation(() => throwError(() => new Error('sample error')));

      expect(
        async () =>
          await controller.getUserProfile({
            platform: 'uplay',
            username: 'sampleUser',
          }),
      ).rejects.toThrow();
    });
  });

  describe('searchUser', () => {
    it('Should return a list of users', async () => {
      cheaterService.searchUser = jest
        .fn()
        .mockImplementation(() => of({ data: 'sampleData' }));

      const response = await controller.searchUser({
        platform: 'uplay',
        query: 'sample',
      });

      expect(response).toEqual('sampleData');
      expect(cheaterService.searchUser).toHaveBeenCalledWith({
        platform: 'uplay',
        query: 'sample',
      });
    });

    it('Should throw an error searching for user', () => {
      cheaterService.searchUser = jest
        .fn()
        .mockImplementation(() => throwError(() => new Error('sample error')));

      expect(
        async () =>
          await controller.searchUser({ platform: 'uplay', query: 'sample' }),
      ).rejects.toThrow();
    });
  });

  describe('createCheater', () => {
    it('Should create a new cheater', async () => {
      const response = await controller.createCheater({
        name: 'sample name',
        description: 'sample description',
      });

      expect(response).toEqual('sample data');
      expect(createCheater).toHaveBeenCalledWith({
        name: 'sample name',
        description: 'sample description',
      });
    });
  });

  describe('deleteCheater', () => {
    it('Should delete a cheater', async () => {
      const response = await controller.deleteCheater('sampleCheaterId');

      expect(response).toEqual(undefined);
      expect(deleteCheater).toHaveBeenCalledWith('sampleCheaterId');
    });

    it('Should throw an error trying to delete a non-existing cheater', async () => {
      cheaterService.deleteCheater = jest
        .fn()
        .mockResolvedValue({ affected: 0 });

      expect(
        async () => await controller.deleteCheater('sampleCheaterId'),
      ).rejects.toThrow();
    });
  });

  describe('getCheater', () => {
    it('Should return a single', async () => {
      const response = await controller.getCheater('sampleId');

      expect(response).toEqual('sample cheater');
      expect(getCheaterById).toHaveBeenCalledWith('sampleId');
    });
  });

  describe('getCheaters', () => {
    it('Should get a list of cheaters', async () => {
      const response = await controller.getCheaters(
        { size: '10', number: '1' },
        ['-name'],
        ['name:hayabusa'],
      );

      expect(response).toEqual(['cheater1', 'cheater2']);
      expect(getCheaters).toHaveBeenCalledWith(
        { size: '10', number: '1' },
        ['-name'],
        ['name:hayabusa'],
      );
    });
  });

  describe('createClan', () => {
    it('Should create a new clan', async () => {
      const response = await controller.createClan('sampleId', {
        tag: 'sample tag',
        name: 'sample clan',
      });

      expect(response).toEqual('createdClan');
      expect(createClan).toHaveBeenCalledWith('sampleId', {
        tag: 'sample tag',
        name: 'sample clan',
      });
    });
  });

  describe('createAlias', () => {
    it('Should create a new alias', async () => {
      const response = await controller.createAlias('sampleId', {
        name: 'sample alias',
      });

      expect(response).toEqual('createdAlias');
      expect(createAlias).toHaveBeenCalledWith('sampleId', {
        name: 'sample alias',
      });
    });
  });
});
