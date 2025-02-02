import { ApiProperty } from '@nestjs/swagger';

export class AddMovieDto {
    @ApiProperty({ example: '12345', description: 'The ID from TMDB of the movie to add' })
    movieId: string;
}