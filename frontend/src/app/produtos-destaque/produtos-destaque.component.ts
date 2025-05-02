import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-produtos-destaque',
  imports: [CommonModule],
  templateUrl: './produtos-destaque.component.html',
  styleUrl: './produtos-destaque.component.css'
})
export class ProdutosDestaqueComponent {

  produtos = [
    {
      nome: 'Jogo de Cama Queen',
      descricao: 'Toque macio, 4 peças, 100% algodão.',
      preco: 189.90,
      imagem: 'assets/produtos/jogo-de-cama.jpg'
    },
    {
      nome: 'Travesseiro NASA',
      descricao: 'Alta densidade e conforto ergonômico.',
      preco: 89.90,
      imagem: 'assets/produtos/travesseiro-nasa.jpg'
    },
    {
      nome: 'Toalha de Banho Luxo',
      descricao: 'Absorção ultra rápida, fio penteado.',
      preco: 59.90,
      imagem: 'assets/produtos/toalha-banho.jpg'
    },
    {
      nome: 'Almofada Decorativa',
      descricao: 'Enchimento siliconado e capa removível.',
      preco: 39.90,
      imagem: 'assets/produtos/almofada.jpg'
    },
    {
      nome: 'Jogo Americano Rústico',
      descricao: 'Estilo natural, 6 peças em juta.',
      preco: 49.90,
      imagem: 'assets/produtos/jogo-americano.jpg'
    },
    {
      nome: 'Capa de Edredom Floral',
      descricao: 'Estampa suave, zíper invisível.',
      preco: 129.90,
      imagem: 'assets/produtos/capa-edredom.jpg'
    }
  ];

}
