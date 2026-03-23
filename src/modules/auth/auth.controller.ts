import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/roles.decorator';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Criar nova conta',
    description: 'Rota para criar uma nova conta',
  })
  @ApiCreatedResponse({ description: 'Conta criada com sucesso' })
  @ApiBadRequestResponse({ description: 'E-mail ja cadastrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  register(@Body() dto: RegisterAuthDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Efetuar login',
    description: 'Rota para efetuar login',
  })
  @ApiCreatedResponse({ description: 'Login efetuado com sucesso' })
  @ApiBadRequestResponse({ description: 'Credenciais inválidas' })
  @ApiNotFoundResponse({ description: 'Usuario nao encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  login(@Body() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar access token via refresh token',
    description: 'Rota para renovar access token via refresh token',
  })
  @ApiCreatedResponse({ description: 'Access token renovado com sucesso' })
  @ApiBadRequestResponse({ description: 'Refresh token inválido ou expirado' })
  @ApiNotFoundResponse({ description: 'Refresh token nao encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout (revoga refresh token)',
    description: 'Rota para logout (revoga refresh token)',
  })
  @ApiCreatedResponse({ description: 'Logout realizado com sucesso' })
  @ApiBadRequestResponse({ description: 'Refresh token inválido ou expirado' })
  @ApiNotFoundResponse({ description: 'Refresh token nao encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  logout(@CurrentUser('id') userId: string, @Body() dto: RefreshTokenDto) {
    return this.authService.logout(userId, dto.refreshToken);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout em todos os dispositivos',
    description: 'Rota para logout em todos os dispositivos',
  })
  @ApiCreatedResponse({ description: 'Logout realizado com sucesso' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  logoutAll(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Alterar senha',
    description: 'Rota para alterar senha',
  })
  @ApiCreatedResponse({ description: 'Senha alterada com sucesso' })
  @ApiBadRequestResponse({ description: 'Senha atual incorreta' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dados do usuário autenticado',
    description: 'Rota para obter dados do usuário autenticado',
  })
  @ApiOkResponse({
    description: 'Dados do usuário autenticado obtidos com sucesso',
  })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  me(@CurrentUser() user: any) {
    return user;
  }
}
