import { ApiProperty } from '@nestjs/swagger';

export class RemoveMovieDto {
  @ApiProperty({
    example: '12345',
    description: 'The ID from TMDB of the movie to remove',
  })
  movieId: string;
}
