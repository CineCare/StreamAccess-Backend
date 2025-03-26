import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from '../events.gateway';
import { UsersModule } from '../../users/users.module';

describe('EventsGateway', () => {
  let gateway: EventsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should have a sleep method', () => {
    expect(gateway.sleep).toBeDefined();
  });
  it('should have a randomMessage method', () => {
    expect(gateway.randomMessage).toBeDefined();
  });
  it('should have an afterInit method', () => {
    expect(gateway.afterInit).toBeDefined();
  });

  it('should resolve after the specified time', async () => {
    const start = Date.now();
    const delay = 100; // 100ms
    await gateway.sleep(delay);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(delay - 1);
  });
});
