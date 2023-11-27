import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Base } from './base.model';
import { WordForm } from '@prisma/client';

registerEnumType(WordForm, { name: 'WordForm' });

@ObjectType()
export class Word extends Base {
  @Field()
  word: string;

  @Field()
  translation: string;

  @Field()
  definition: string;

  @Field(() => [String])
  sentences: string[];

  @Field(() => Int)
  progress: number;

  @Field(() => WordForm)
  form: WordForm;
}
