import { createUnionType } from '@nestjs/graphql';
import { Owner } from 'src/owners/entities/owner.entity';
import { Pet } from './pet.entity';

export const OwnerUnion = createUnionType({
  name: 'OwnerUnion',
  types: () => [Pet, Owner],
});
