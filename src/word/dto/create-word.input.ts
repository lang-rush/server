import { BadRequestException } from '@nestjs/common';
import { Field, ID, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsAlpha,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { TranslateWordInput } from './translate-word.input';
import { WordForm } from '@prisma/client';

@InputType()
export class CreateWordInput extends TranslateWordInput {
  @Field()
  @Length(1, 24)
  @Transform(({ value }) => value.toLowerCase())
  @Matches(/^\p{L}+$/u, {
    message: 'Translation must only contain letters.',
  })
  translation: string;

  @Field()
  @Length(1, 255)
  @Matches(/^[a-zA-Z0-9 ',.!?]+$/)
  @Transform(({ value }) => transformSentence(value))
  definition: string;

  @Field(() => [String])
  @ArrayNotEmpty()
  @ArrayMaxSize(3)
  @Length(1, 255, { each: true })
  @Matches(/^[a-zA-Z0-9 ',.!?]+$/, { each: true })
  @Transform(({ value }) => value.map((v: string) => transformSentence(v)))
  sentences: string[];

  @Field(() => WordForm)
  form: WordForm;

  @Field(() => ID)
  folderId: string;

  @OtherForms()
  otherNouns?: string[];

  @OtherForms()
  otherAdjs?: string[];

  @OtherForms()
  otherVerbs?: string[];

  @OtherForms()
  otherAdvs?: string[];
}

function transformSentence(value: string): string {
  let newValue = value.charAt(0).toUpperCase() + value.slice(1);
  const lastChar = newValue.charAt(newValue.length - 1);
  if (lastChar !== '.' && lastChar !== '!' && lastChar !== '?') {
    newValue += '.';
  }
  return newValue;
}

function OtherForms(): PropertyDecorator {
  return function (target: PropertyDecorator, propertyKey: string | symbol) {
    Field(() => [String], { nullable: true })(target, propertyKey);
    IsOptional()(target, propertyKey);
    ArrayNotEmpty()(target, propertyKey);
    ArrayMaxSize(3)(target, propertyKey);
    Length(1, 24, { each: true })(target, propertyKey);
    Transform(({ value }) => value.map((v: string) => v.toLowerCase()))(
      target,
      propertyKey,
    );
    IsAlpha('en-US', { each: true })(target, propertyKey);
  };
}
