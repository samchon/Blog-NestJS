import { Controller, Get, Post, Res, UseGuards, Request } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/skip-auth.decorator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

import { CookieOptions, Response } from 'express';
import { AuthLoginRequestDto } from './dto/auth-login.request.dto';

// req, res에 대해 알고있는 영역
@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  // AuthService의 login 함수를 사용하기 위하여 constructor에 선언해 줘야 합니다.
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 201,
    description: 'login 성공',
  })
  @ApiBody({
    type: AuthLoginRequestDto,
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { token, options } = await this.authService.login(req.user);
    // 반환된 Token 값을 쿠키에 저장합니다.
    // 저장하기 위하여 res가 필요합니다.
    //토큰을 쿠키에 등록해주기(express)
    res.cookie('Authentication', token, options);
    res.send('login 성공');
  }

  @ApiCookieAuth('Authentication')
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  protected(@Request() req): string {
    return req.user; //TODO : require an bearer token, validate token
  }

  @ApiCookieAuth('Authentication')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 201,
    description: 'logout 성공',
  })
  @Post('logout')
  async logOut(@Res({ passthrough: true }) res: Response) {
    const { token, options } = await this.authService.logOut();
    // 쿠키 날리는 방식 2
    //   res.clearCookie('Authentication', { httpOnly: true });
    res.cookie('Authentication', token, options);
    res.send('logout 성공');
  }
}