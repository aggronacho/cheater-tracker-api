import { lastValueFrom } from 'rxjs';
import {
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  HttpCode,
  Controller,
  HttpStatus,
  ParseArrayPipe,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { PageDto } from '../dto/page.dto';
import { Clan } from '../entities/clan.entity';
import { Alias } from '../entities/alias.entity';
import { GetUserDto } from '../dto/get-user.dto';
import { Cheater } from '../entities/cheater.entity';
import { CreateClanDto } from '../dto/create-clan.dto';
import { CreateAliasDto } from '../dto/create-alias.dto';
import { CreateCheaterDto } from '../dto/create-cheater.dto';
import { CheaterService } from '../services/cheater.service';
import { SearchUserParamDto } from '../dto/search-user-param.dto';
import { UserApiSearch } from '../entities/user-api-search.entity';
import { UserApiProfile } from '../entities/user-api-profile.entity';

@ApiTags('cheaters')
@Controller('api/v1/cheaters')
export class CheaterController {
  constructor(private readonly cheaterService: CheaterService) {}

  @ApiOkResponse({
    description: 'Get user profile data from tracker.gg',
    type: UserApiProfile,
  })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiInternalServerErrorResponse({
    description: 'Catch errors getting data from tracker.gg',
  })
  @Get(':platform/:username')
  async getUserProfile(
    @Param() getUserDto: GetUserDto,
  ): Promise<UserApiProfile> {
    try {
      const { data } = await lastValueFrom(
        this.cheaterService.getUserProfile(getUserDto),
      );

      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error getting user profile');
    }
  }

  @ApiOkResponse({
    description: 'Search user in tracker.gg',
    type: UserApiSearch,
  })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiInternalServerErrorResponse({
    description: 'Catch errors getting data from tracker.gg',
  })
  @Get('search')
  async searchUser(
    @Query() searchUserParamDto: SearchUserParamDto,
  ): Promise<UserApiSearch> {
    try {
      const { data } = await lastValueFrom(
        this.cheaterService.searchUser(searchUserParamDto),
      );

      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error searching the user');
    }
  }

  @ApiCreatedResponse({ description: 'Create a new cheater', type: Cheater })
  @ApiConflictResponse({ description: 'Duplicate cheater' })
  @ApiInternalServerErrorResponse({
    description: 'Error creating the cheater',
  })
  @Post()
  async createCheater(
    @Body() createCheaterDto: CreateCheaterDto,
  ): Promise<Cheater> {
    return this.cheaterService.createCheater(createCheaterDto);
  }

  @ApiNoContentResponse({ description: 'Delete a cheater' })
  @ApiNotFoundResponse({ description: 'Cheater not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteCheater(@Param('id') id: string): Promise<void> {
    const { affected } = await this.cheaterService.deleteCheater(id);

    if (affected === 0) {
      throw new NotFoundException(`Cheater with id ${id} not found`);
    }

    return;
  }

  @ApiOkResponse({ description: 'Get cheater by id', type: Cheater })
  @ApiNotFoundResponse({ description: 'Cheater not found' })
  @Get(':id')
  async getCheater(@Param('id') id: string): Promise<Cheater> {
    return this.cheaterService.getCheaterById(id);
  }

  @ApiQuery({ name: 'page[size]', example: 10, required: false })
  @ApiQuery({ name: 'page[number]', example: 1, required: false })
  @ApiQuery({ name: 'sort', example: ['name'], required: false })
  @ApiQuery({ name: 'filter', example: ['name:somename'], required: false })
  @ApiOkResponse({ description: 'Get an array of cheaters', type: [Cheater] })
  @Get()
  getCheaters(
    @Query('page') pageDto: PageDto,
    @Query(
      'sort',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    sort: string[],
    @Query(
      'filter',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    filter: string[],
  ): Promise<Cheater[]> {
    return this.cheaterService.getCheaters(pageDto, sort, filter);
  }

  @ApiCreatedResponse({ description: 'Add clan to a cheater', type: Clan })
  @ApiNotFoundResponse({ description: 'Cheater not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error creating the clan',
  })
  @Post(':cheaterId/clans')
  createClan(
    @Param('cheaterId') cheaterId: string,
    @Body() createClanDto: CreateClanDto,
  ): Promise<Clan> {
    return this.cheaterService.createClan(cheaterId, createClanDto);
  }

  @ApiCreatedResponse({ description: 'Add an alias to a cheater', type: Alias })
  @ApiNotFoundResponse({ description: 'Cheater not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error creating the alias',
  })
  @Post(':cheaterId/alias')
  createAlias(
    @Param('cheaterId') cheaterId: string,
    @Body() createAliasDto: CreateAliasDto,
  ): Promise<Alias> {
    return this.cheaterService.createAlias(cheaterId, createAliasDto);
  }
}
