import { ApiProperty } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiProperty({
    example: '12345',
    description:
      'The ID from TMDB of the movie to update, the ID itself cannot be updated',
  })
  movieId: string;

  @ApiProperty({
    example: 'my_movie.mkv',
    description: 'The file name of the movie',
  })
  fileName?: string;

  @ApiProperty({ example: 40, description: 'The file size of the movie in GB' })
  fileSize?: number;
}
