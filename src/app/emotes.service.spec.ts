import { TestBed } from '@angular/core/testing';

import { EmotesService } from './emotes.service';

describe('EmotesService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: EmotesService = TestBed.get(EmotesService);
        expect(service).toBeTruthy();
    });
});
