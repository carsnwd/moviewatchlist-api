import { Test, TestingModule } from '@nestjs/testing';
import { TmdbModule } from './tmdb.module';
import { TmdbService } from './tmdb.service';

describe('TmdbModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [TmdbModule],
            providers: [
            ],
        }).compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should provide TmdbService', () => {
        const tmdbService = module.get<TmdbService>(TmdbService);
        expect(tmdbService).toBeDefined();
    });
});