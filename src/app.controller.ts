import { Controller, Get, Post, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthenticatedGuard } from './auth/authenticated.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './common/decorators/skip-auth.decorator';
import { Response } from 'express';

// req, res에 대해 알고있는 영역
@Controller()
export class AppController {
  // AuthService의 login 함수를 사용하기 위하여 constructor에 선언해 줘야 합니다.
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    // return this.authService.login(req.user); // TODO: return jwt access token

    //토큰을 쿠키에 등록해주기(express)
    const { token, ...options } = await this.authService.login(req.user);
    // 반환된 Token 값을 쿠키에 저장합니다.
    // 저장하기 위하여 res가 필요합니다.
    res.cookie('Authentication', token, options);
    res.send('login 성공');
  }

  // 세션 인증방식으로 할때 필요한 코드
  // @UseGuards(AuthenticatedGuard)
  @UseGuards(JwtAuthGuard)
  @Get('auth/protected')
  protected(@Request() req): string {
    return req.user; //TODO : require an bearer token, validate token
  }

  @ApiCookieAuth('Authentication')
  @ApiOperation({ summary: '로그아웃' })
  @Post('auth/logout')
  async logOut(@Res({ passthrough: true }) res: Response) {
    const { token, ...options } = await this.authService.logOut();
    //   res.clearCookie('Authentication', { httpOnly: true });
    res.cookie('Authentication', token, options);
    res.send('logout 성공');
  }

  // 세션 인증방식으로 할때 필요한 코드
  // @ApiCookieAuth('connect.sid')
  // @ApiOperation({ summary: '로그아웃' })
  // @UseGuards(AuthenticatedGuard)
  // @Post('auth/logout')
  // async logout(@Response() res) {
  //   res.clearCookie('connect.sid', { httpOnly: true });
  //   return res.send('ok');
  // }

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
}
