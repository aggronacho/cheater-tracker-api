import { of, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CheaterService } from './cheater.service';
import { Cheater } from '../entities/cheater.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('CheaterService', () => {
  let getHttp;
  let getConfig;
  let service: CheaterService;
  let cheaterRepository: Repository<Cheater>;

  beforeEach(async () => {
    getHttp = jest.fn().mockImplementation(() => of('sample data'));
    getConfig = jest.fn().mockImplementation((arg) => {
      let value = 'defaultValue';

      if (arg === 'trackerBaseUrl') {
        value = 'http://sample.com';
      } else if (arg === 'trackerApiKey') {
        value = 'sampleApiKey';
      }

      return value;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HttpService, useValue: { get: getHttp } },
        { provide: ConfigService, useValue: { get: getConfig } },
        { provide: getRepositoryToken(Cheater), useValue: {} },
        CheaterService,
      ],
    }).compile();

    service = module.get<CheaterService>(CheaterService);
    cheaterRepository = module.get(getRepositoryToken(Cheater));
  });

  describe('getUserProfile', () => {
    it('Should get user profile', async () => {
      const response = await lastValueFrom(
        service.getUserProfile({ platform: 'uplay', username: 'sample' }),
      );

      expect(response).toEqual('sample data');
      expect(getConfig).toHaveBeenNthCalledWith(1, 'trackerBaseUrl');
      expect(getConfig).toHaveBeenNthCalledWith(2, 'trackerApiKey');
      expect(getHttp).toHaveBeenCalledWith(
        'http://sample.com/profile/uplay/sample',
        {
          headers: {
            'TRN-Api-Key': 'sampleApiKey',
          },
        },
      );
    });
  });

  describe('searchUser', () => {
    it('Should get a list of users', async () => {
      const response = await lastValueFrom(
        service.searchUser({ platform: 'uplay', query: 'sample' }),
      );

      expect(response).toEqual('sample data');
      expect(getConfig).toHaveBeenNthCalledWith(1, 'trackerApiKey');
      expect(getConfig).toHaveBeenNthCalledWith(2, 'trackerBaseUrl');
      expect(getHttp).toHaveBeenCalledWith('http://sample.com/search', {
        params: { platform: 'uplay', query: 'sample' },
        headers: {
          'TRN-Api-Key': 'sampleApiKey',
        },
      });
    });
  });

  describe('createCheater', () => {
    it('Should create a new cheater', async () => {
      cheaterRepository.save = jest.fn().mockImplementation((arg) => {
        arg.id = 'someRandomCheaterId';

        for (const clan of arg.clans) {
          clan.id = 'someRandomClanId';
        }

        for (const alias of arg.aliases) {
          alias.id = 'someRandomAliasId';
        }

        return arg;
      });

      const response = await service.createCheater({
        name: 'cheater name',
        description: 'some description',
        clans: [{ tag: 'SMP', name: 'sample' }],
        aliases: [{ name: 'another nickname' }],
      });

      expect(response).toEqual({
        name: 'cheater name',
        description: 'some description',
        clans: [{ tag: 'SMP', name: 'sample', id: 'someRandomClanId' }],
        aliases: [{ name: 'another nickname', id: 'someRandomAliasId' }],
        id: 'someRandomCheaterId',
      });
    });

    it('Should throw an exception saving a duplicate cheater', () => {
      cheaterRepository.save = jest.fn().mockImplementation(() => {
        const error = new Error('sample error');
        error['errno'] = 1062;

        throw error;
      });

      expect(
        async () =>
          await service.createCheater({
            name: 'cheater name',
            description: 'some description',
            clans: [{ tag: 'SMP', name: 'sample' }],
            aliases: [{ name: 'another nickname' }],
          }),
      ).rejects.toThrow('Cheater already exists');
    });

    it('Should throw a generic error', () => {
      cheaterRepository.save = jest
        .fn()
        .mockRejectedValue(new Error('generic error'));

      expect(
        async () =>
          await service.createCheater({
            name: 'cheater name',
            description: 'some description',
            clans: [{ tag: 'SMP', name: 'sample' }],
            aliases: [{ name: 'another nickname' }],
          }),
      ).rejects.toThrow('Error creating the cheater');
    });
  });

  describe('deleteCheater', () => {
    it('Should delete a cheater', async () => {
      cheaterRepository.delete = jest.fn().mockResolvedValue(true);

      await service.deleteCheater('sampleCheaterId');

      expect(cheaterRepository.delete).toHaveBeenCalledWith('sampleCheaterId');
    });
  });

  describe('getCheaterById', () => {
    it('Should find a cheater by id', async () => {
      cheaterRepository.findOne = jest.fn().mockResolvedValue('someCheater');

      const response = await service.getCheaterById('sampleCheaterId');

      expect(response).toEqual('someCheater');
      expect(cheaterRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'sampleCheaterId' },
      });
    });

    it('Should throw a not found exception', async () => {
      cheaterRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(
        async () => await service.getCheaterById('sampleCheaterId'),
      ).rejects.toThrow('Cheater with id sampleCheaterId not found');
    });
  });

  describe('getCheaters', () => {
    it('Should return a list of cheaters filter by like', async () => {
      const getMany = jest.fn().mockResolvedValue(['cheater 1', 'cheater 2']);
      const andWhere = jest.fn().mockImplementation(() => ({
        setParameters: jest.fn(),
      }));
      const addOrderBy = jest.fn();
      const offset = jest.fn().mockImplementation(() => ({
        addOrderBy,
        andWhere,
        getMany,
      }));
      const limit = jest.fn().mockImplementation(() => ({
        offset,
      }));
      const leftJoinAndSelect2 = jest.fn().mockImplementation(() => ({
        limit,
      }));
      const leftJoinAndSelect1 = jest.fn().mockImplementation(() => ({
        leftJoinAndSelect: leftJoinAndSelect2,
      }));

      cheaterRepository.createQueryBuilder = jest
        .fn()
        .mockImplementation(() => ({
          leftJoinAndSelect: leftJoinAndSelect1,
        }));

      const response = await service.getCheaters(
        { number: '1', size: '10' },
        ['-name'],
        ['name:sample'],
      );

      expect(response).toEqual(['cheater 1', 'cheater 2']);
      expect(cheaterRepository.createQueryBuilder).toHaveBeenCalledWith(
        'cheaters',
      );
      expect(leftJoinAndSelect1).toHaveBeenCalledWith(
        'cheaters.aliases',
        'aliases',
      );
      expect(leftJoinAndSelect2).toHaveBeenCalledWith(
        'cheaters.clans',
        'clans',
      );
      expect(limit).toHaveBeenLastCalledWith(10);
      expect(offset).toHaveBeenCalledWith(0);
      expect(addOrderBy).toHaveBeenCalledWith('cheaters.name', 'DESC');
      expect(andWhere).toHaveBeenCalledWith('cheaters.name = :value0');
      expect(getMany).toHaveBeenCalledTimes(1);
    });

    it('Should return a list of cheaters', async () => {
      const getMany = jest.fn().mockResolvedValue(['cheater 1', 'cheater 2']);
      const andWhere = jest.fn().mockImplementation(() => ({
        setParameters: jest.fn(),
      }));
      const addOrderBy = jest.fn();
      const offset = jest.fn().mockImplementation(() => ({
        addOrderBy,
        andWhere,
        getMany,
      }));
      const limit = jest.fn().mockImplementation(() => ({
        offset,
      }));
      const leftJoinAndSelect2 = jest.fn().mockImplementation(() => ({
        limit,
      }));
      const leftJoinAndSelect1 = jest.fn().mockImplementation(() => ({
        leftJoinAndSelect: leftJoinAndSelect2,
      }));

      cheaterRepository.createQueryBuilder = jest
        .fn()
        .mockImplementation(() => ({
          leftJoinAndSelect: leftJoinAndSelect1,
        }));

      const response = await service.getCheaters(
        { number: '1', size: '10' },
        ['-name'],
        ['name%sample'],
      );

      expect(response).toEqual(['cheater 1', 'cheater 2']);
      expect(andWhere).toHaveBeenCalledWith('cheaters.name LIKE :value0');
    });
  });

  describe('createClan', () => {
    it('Should create a new clan', async () => {
      service.getCheaterById = jest.fn().mockResolvedValue({
        name: 'sample',
        description: 'sample description',
        clans: [{ id: 'randomIdClan', tag: 'RNG', name: 'random' }],
      });
      cheaterRepository.save = jest.fn().mockImplementation((cheater) => {
        for (const clan of cheater.clans) {
          if (!clan.id) {
            clan.id = 'someNewRandomId';
          }
        }

        return cheater;
      });

      const response = await service.createClan('sampleId', {
        tag: 'SMP',
        name: 'sample',
      });

      expect(response).toEqual({
        tag: 'SMP',
        name: 'sample',
        id: 'someNewRandomId',
      });
      expect(service.getCheaterById).toHaveBeenCalledWith('sampleId');
      expect(cheaterRepository.save).toHaveBeenCalledWith({
        name: 'sample',
        description: 'sample description',
        clans: [
          { id: 'randomIdClan', tag: 'RNG', name: 'random' },
          { id: 'someNewRandomId', tag: 'SMP', name: 'sample' },
        ],
      });
    });

    it('Should throw an exception when saving a clan', async () => {
      service.getCheaterById = jest.fn().mockResolvedValue({
        name: 'sample',
        description: 'sample description',
        clans: [{ id: 'randomIdClan', tag: 'RNG', name: 'random' }],
      });
      cheaterRepository.save = jest
        .fn()
        .mockRejectedValue(new Error('sample error'));

      expect(
        async () =>
          await service.createClan('sampleId', {
            tag: 'SMP',
            name: 'sample',
          }),
      ).rejects.toThrow('Error creating the clan');
    });

    it('Should throw an exception when creating a clan that already is in', () => {
      service.getCheaterById = jest.fn().mockResolvedValue({
        name: 'sample',
        description: 'sample description',
        clans: [{ id: 'randomIdClan', tag: 'RNG', name: 'random' }],
      });

      expect(
        async () =>
          await service.createClan('sampleId', {
            tag: 'RNG',
            name: 'sample',
          }),
      ).rejects.toThrow('Cheater is already on clan RNG');
    });
  });

  describe('createAlias', () => {
    it('Should create a new alias', async () => {
      service.getCheaterById = jest.fn().mockResolvedValue({
        name: 'sample',
        description: 'sample description',
        aliases: [{ id: 'randomIdAlias', name: 'some alias' }],
      });
      cheaterRepository.save = jest.fn().mockImplementation((cheater) => {
        for (const alias of cheater.aliases) {
          if (!alias.id) {
            alias.id = 'someNewRandomId';
          }
        }

        return cheater;
      });

      const response = await service.createAlias('sampleId', {
        name: 'another alias',
      });

      expect(response).toEqual({
        name: 'another alias',
        id: 'someNewRandomId',
      });
      expect(service.getCheaterById).toHaveBeenCalledWith('sampleId');
      expect(cheaterRepository.save).toHaveBeenCalledWith({
        name: 'sample',
        description: 'sample description',
        aliases: [
          { id: 'randomIdAlias', name: 'some alias' },
          { id: 'someNewRandomId', name: 'another alias' },
        ],
      });
    });

    it('Should throw an exception when saving a new alias', async () => {
      service.getCheaterById = jest.fn().mockResolvedValue({
        name: 'sample',
        description: 'sample description',
        aliases: [{ id: 'randomIdAlias', name: 'some alias' }],
      });
      cheaterRepository.save = jest
        .fn()
        .mockRejectedValue(new Error('sample error'));

      expect(
        async () =>
          await service.createAlias('sampleId', {
            name: 'another alias',
          }),
      ).rejects.toThrow('Error creating the alias');
    });

    it('Should throw an exception when a user has already an alias', () => {
      service.getCheaterById = jest.fn().mockResolvedValue({
        name: 'sample',
        description: 'sample description',
        aliases: [{ id: 'randomIdAlias', name: 'some alias' }],
      });

      expect(
        async () =>
          await service.createAlias('sampleId', {
            name: 'some alias',
          }),
      ).rejects.toThrow('Cheater has already this nickname some alias');
    });
  });
});
