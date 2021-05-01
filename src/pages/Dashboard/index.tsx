import { useEffect, useState } from 'react';

import {Header} from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { FoodsContainer } from './styles';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';

interface Food {
  id: number,
  available: boolean,
  image: string,
  name: string,
  description: string,
  price: string
}

export function Dashboard() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food>();

  useEffect(() => {
    api.get('/foods').then(response => setFoods(response.data));
  }, [])

  function toggleModal() {
    const isModelOpen = modalOpen;
    setModalOpen(!isModelOpen);
  }

  async function handleAddFood(food: Food) {
    const updatedFoods = [...foods];

    const savedFood = await api.post('/foods', {
      ...food,
      available: true
    });

    updatedFoods.push(savedFood.data);
    setFoods(updatedFoods);
  } 

  function handleDeleteFood(foodId: number) {
    const updatedFoods = [...foods];

    const index = updatedFoods.findIndex(food => food.id === foodId);

    if (index != -1) {
      updatedFoods.splice(index, 1);
    }

    setFoods(updatedFoods);
  }

  function handleEditFood(food: Food) {
    setEditModalOpen(!editModalOpen);
    setEditingFood(food);
  }

  async function handleUpdateFood(foodToUpdate: Food) {
    const updatedFoods = [...foods];

    const foodUpdated = await api.put(`/foods/${editingFood?.id}`, {
      ...editingFood, ...foodToUpdate
    });

    const foodExists = updatedFoods.find(food => food.id === editingFood?.id);

    if (foodExists) {
      foodExists.description = foodUpdated.data.description;
      foodExists.image = foodUpdated.data.image;
      foodExists.name = foodUpdated.data.name;
      foodExists.price = foodUpdated.data.price;
      foodExists.available = foodUpdated.data.available;
    }

    setFoods(updatedFoods);   
  }

  function toggleEditModal() {
    setEditModalOpen(!editModalOpen);
  }

  return(
    <>
        <Header openModal={toggleModal} />
        <ModalAddFood
          isOpen={modalOpen}
          setIsOpen={toggleModal}
          handleAddFood={handleAddFood}
        />
        <ModalEditFood
          isOpen={editModalOpen}
          setIsOpen={toggleEditModal}
          editingFood={editingFood}
          handleUpdateFood={handleUpdateFood}
        />

        <FoodsContainer data-testid="foods-list">
          {foods &&
            foods.map(food => (
              <Food
                key={food.id}
                food={food}
                handleDelete={handleDeleteFood}
                handleEditFood={handleEditFood}
              ></Food>
            ))}
        </FoodsContainer>
      </>
  );
}