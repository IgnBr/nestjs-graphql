import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Parent,
  ResolveField,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'apollo-server-express';
import { Owner } from 'src/owners/entities/owner.entity';
import { CreatePetInput } from './dto/create-pet.input';
import { Pet } from './pet.entity';
import { PetsService } from './pets.service';

@Resolver((of) => Pet)
export class PetsResolver {
  private pubSub = new PubSub();

  constructor(private petsService: PetsService) {}

  @Query((returns) => [Pet])
  pets(): Promise<Pet[]> {
    return this.petsService.findAll();
  }

  @Query((returns) => [Pet])
  getPet(@Args('id', { type: () => Int }) id: number): Promise<Pet> {
    return this.petsService.findOne(id);
  }

  @Mutation((returns) => Pet)
  async createPet(
    @Args('createPetInput') createPetInput: CreatePetInput,
  ): Promise<Pet> {
    const pet = await this.petsService.createPet(createPetInput);
    this.pubSub.publish('petAdded', { pet });
    return pet;
  }

  @ResolveField((returns) => Owner)
  owner(@Parent() pet: Pet): Promise<Owner> {
    return this.petsService.getOwner(pet.ownerId);
  }

  @Subscription((returns) => Pet, {
    filter: (payload, variables) => payload.pet.ownerId === variables.ownerId,
    resolve: (payload) => payload.pet,
  })
  petAdded(@Args('ownerId') ownerId: number) {
    return this.pubSub.asyncIterator('petAdded'); //?
  }
}
