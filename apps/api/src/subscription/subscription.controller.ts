import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async getSubscription(@Req() req) {
    return this.subscriptionService.getUserSubscription(req.user.id);
  }

  @Get('limits')
  async getLimits(@Req() req) {
    return this.subscriptionService.getSubscriptionLimits(req.user.id);
  }

  @Post('cancel')
  async cancelSubscription(@Req() req, @Body() body: { cancelAtPeriodEnd?: boolean }) {
    return this.subscriptionService.cancelSubscription(req.user.id, body.cancelAtPeriodEnd);
  }
}

