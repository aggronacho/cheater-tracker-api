import { Observable } from 'rxjs';
import { DeleteResult, Repository } from 'typeorm';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PageDto } from '../dto/page.dto';
import { Clan } from '../entities/clan.entity';
import { GetUserDto } from '../dto/get-user.dto';
import { Alias } from '../entities/alias.entity';
import { Cheater } from '../entities/cheater.entity';
import { CreateClanDto } from '../dto/create-clan.dto';
import { CreateAliasDto } from '../dto/create-alias.dto';
import { CreateCheaterDto } from '../dto/create-cheater.dto';
import { SearchUserParamDto } from '../dto/search-user-param.dto';
import { UserApiSearch } from '../entities/user-api-search.entity';
import { UserApiProfile } from '../entities/user-api-profile.entity';

enum DB_RESPONSE {
  DUPLICATE_ENTRY = 1062,
}

@Injectable()
export class CheaterService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Cheater)
    private cheaterRepository: Repository<Cheater>,
  ) {}

  getUserProfile(
    getUserDto: GetUserDto,
  ): Observable<AxiosResponse<UserApiProfile>> {
    const { platform, username } = getUserDto;
    const baseUrl = this.configService.get<string>('trackerBaseUrl');
    const apiKey = this.configService.get<string>('trackerApiKey');
    const url = `${baseUrl}/profile/${platform}/${username}`;

    return this.httpService.get(url, {
      headers: {
        'TRN-Api-Key': apiKey,
      },
    });
  }

  searchUser(
    searchUserParamDto: SearchUserParamDto,
  ): Observable<AxiosResponse<UserApiSearch>> {
    const { platform, query } = searchUserParamDto;
    const apiKey = this.configService.get<string>('trackerApiKey');
    const baseUrl = this.configService.get<string>('trackerBaseUrl');
    const url = `${baseUrl}/search`;

    return this.httpService.get(url, {
      params: { platform, query },
      headers: {
        'TRN-Api-Key': apiKey,
      },
    });
  }

  async createCheater(createCheaterDto: CreateCheaterDto): Promise<Cheater> {
    const { name, description } = createCheaterDto;

    const cheater = new Cheater();
    cheater.name = name.trim();
    cheater.description = description.trim();

    if (createCheaterDto.clans) {
      const clans: Clan[] = [];

      for (const { tag, name } of createCheaterDto.clans) {
        const relatedClan = new Clan();
        relatedClan.tag = tag;
        relatedClan.name = name;

        clans.push(relatedClan);
      }

      cheater.clans = clans;
    }

    if (createCheaterDto.aliases) {
      const aliases: Alias[] = [];

      for (const { name } of createCheaterDto.aliases) {
        const relatedAlias = new Alias();
        relatedAlias.name = name;

        aliases.push(relatedAlias);
      }

      cheater.aliases = aliases;
    }

    try {
      await this.cheaterRepository.save(cheater);

      return cheater;
    } catch (error) {
      if (error.errno === DB_RESPONSE.DUPLICATE_ENTRY) {
        throw new ConflictException('Cheater already exists');
      }

      throw new InternalServerErrorException('Error creating the cheater');
    }
  }

  async deleteCheater(cheaterId: string): Promise<DeleteResult> {
    return this.cheaterRepository.delete(cheaterId);
  }

  async getCheaterById(id: string): Promise<Cheater> {
    const cheater = await this.cheaterRepository.findOne({ where: { id } });

    if (!cheater) {
      throw new NotFoundException(`Cheater with id ${id} not found`);
    }

    return cheater;
  }

  async getCheaters(
    pageDto: PageDto,
    sort: string[] | undefined,
    filter: string[] | undefined,
  ): Promise<Cheater[]> {
    if (sort === undefined) {
      sort = [];
    }

    if (filter === undefined) {
      filter = [];
    }

    const pageSize = parseInt(pageDto.size);
    const pageNumber = parseInt(pageDto.number);
    const tableName = 'cheaters';
    const queryBuilder = this.cheaterRepository
      .createQueryBuilder(tableName)
      .leftJoinAndSelect(`${tableName}.aliases`, `aliases`)
      .leftJoinAndSelect(`${tableName}.clans`, `clans`)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    for (let attribute of sort) {
      let type: 'ASC' | 'DESC' = 'ASC';

      if (attribute.startsWith('-')) {
        attribute = attribute.slice(1);
        type = 'DESC';
      }

      queryBuilder.addOrderBy(`${tableName}.${attribute}`, type);
    }

    let index = 0;

    for (const expression of filter) {
      // eslint-disable-next-line prefer-const
      let [, attribute, operator, value] = expression.match(
        /^([a-zA-Z]+)(:|<=|>=|<|>|%)(.+)$/,
      );

      operator = operator === ':' ? '=' : operator;
      const newParameter = `value${index++}`;
      let queryExpression = `${tableName}.${attribute} ${operator} :${newParameter}`;

      if (operator === '%') {
        queryExpression = `${tableName}.${attribute} LIKE :${newParameter}`;
        value = `%${value}%`;
      }

      const parameters = {};
      parameters[newParameter] = value;

      queryBuilder.andWhere(queryExpression).setParameters(parameters);
    }

    const cheaters = await queryBuilder.getMany();

    return cheaters;
  }

  async createClan(
    cheaterId: string,
    createClanDto: CreateClanDto,
  ): Promise<Clan> {
    let { tag, name } = createClanDto;
    const cheater = await this.getCheaterById(cheaterId);

    tag = tag.toUpperCase();
    name = name.trim();

    const hasClan = cheater.clans.some((clan) => clan.tag === tag);

    if (hasClan) {
      throw new ConflictException(`Cheater is already on clan ${tag}`);
    }

    const clan = new Clan();
    clan.tag = tag;
    clan.name = name;

    cheater.clans.push(clan);

    try {
      await this.cheaterRepository.save(cheater);

      return clan;
    } catch (error) {
      throw new InternalServerErrorException('Error creating the clan');
    }
  }

  async createAlias(
    cheaterId: string,
    createAliasDto: CreateAliasDto,
  ): Promise<Alias> {
    let { name } = createAliasDto;
    const cheater = await this.getCheaterById(cheaterId);

    name = name.trim();

    const hasNickname = cheater.aliases.some(
      (alias) => alias.name.toLowerCase() === name.toLowerCase(),
    );

    if (hasNickname) {
      throw new ConflictException(`Cheater has already this nickname ${name}`);
    }

    const alias = new Alias();
    alias.name = name.trim();

    cheater.aliases.push(alias);

    try {
      await this.cheaterRepository.save(cheater);

      return alias;
    } catch (error) {
      throw new InternalServerErrorException('Error creating the alias');
    }
  }
}
