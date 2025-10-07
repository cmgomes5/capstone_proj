export class Token {
  ally: boolean;
  currentHP: number;
  totalHP: number;
  initiative: number;
  name: string;
  imageUrl?: string; // Optional image URL for token display

  constructor(
    name: string,
    totalHP: number,
    initiative: number,
    ally: boolean = true,
    currentHP?: number,
    imageUrl?: string
  ) {
    this.name = name;
    this.totalHP = totalHP;
    this.currentHP = currentHP ?? totalHP; // Default to full HP if not specified
    this.initiative = initiative;
    this.ally = ally;
    this.imageUrl = imageUrl;
  }

  // Helper method to check if token is alive
  isAlive(): boolean {
    return this.currentHP > 0;
  }

  // Helper method to check if token is dead
  isDead(): boolean {
    return this.currentHP <= 0;
  }

  // Helper method to take damage
  takeDamage(damage: number): void {
    this.currentHP = Math.max(0, this.currentHP - damage);
  }

  // Helper method to heal
  heal(amount: number): void {
    this.currentHP = Math.min(this.totalHP, this.currentHP + amount);
  }

  // Helper method to get HP percentage
  getHPPercentage(): number {
    return this.totalHP > 0 ? (this.currentHP / this.totalHP) * 100 : 0;
  }

  // Helper method to set HP directly
  setCurrentHP(hp: number): void {
    this.currentHP = Math.max(0, Math.min(this.totalHP, hp));
  }
}
