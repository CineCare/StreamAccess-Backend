import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AppService } from '../app.service';

describe('ThingsModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(AppService)).toBeInstanceOf(AppService);
  });
});
