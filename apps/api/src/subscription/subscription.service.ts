import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subscription, SubscriptionTier, SubscriptionLimits } from '@amora/types';
import { SUBSCRIPTION_LIMITS } from '@amora/config';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['active', 'trial'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    return subscription as Subscription | null;
  }

  async getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
    const subscription = await this.getUserSubscription(userId);
    const tier = subscription?.tier || 'free';
    return SUBSCRIPTION_LIMITS[tier as SubscriptionTier];
  }

  async hasPremiumAccess(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return false;

    const tier = subscription.tier as SubscriptionTier;
    return tier !== 'free' && subscription.status === 'active';
  }

  async checkMessageLimit(userId: string): Promise<boolean> {
    const limits = await this.getSubscriptionLimits(userId);
    if (limits.messagesPerDay === -1) return true;

    // TODO: Implement daily message count tracking
    // For now, return true
    return true;
  }

  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    stripeSubscriptionId?: string,
    stripeCustomerId?: string
  ): Promise<Subscription> {
    // Cancel existing subscriptions
    await this.prisma.subscription.updateMany({
      where: {
        userId,
        status: 'active',
      },
      data: {
        status: 'cancelled',
      },
    });

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        tier,
        status: tier === 'free' ? 'active' : 'trial',
        stripeSubscriptionId,
        stripeCustomerId,
        startDate: new Date(),
      },
    });

    return subscription as Subscription;
  }

  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd,
        status: cancelAtPeriodEnd ? 'active' : 'cancelled',
      },
    });

    return updated as Subscription;
  }
}

