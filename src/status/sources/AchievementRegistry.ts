import { Achievement, Rule } from "../type";
import { StatusRegistry } from "../StatusRegistry";

export class AchievementRegistry {
  private achievements: Achievement[] = [];
  private statusRegistry: StatusRegistry;

  constructor(statusRegistry: StatusRegistry) {
    this.statusRegistry = statusRegistry;
  }

  /**
   * Register a new achievement
   */
  register(achievement: Achievement): void {
    this.achievements.push(achievement);
  }

  /**
   * Get all registered achievements
   */
  getAll(): Achievement[] {
    return this.achievements;
  }

  /**
   * Get an achievement by id
   */
  getById(id: string): Achievement | undefined {
    return this.achievements.find((achievement) => achievement.id === id);
  }

  /**
   * Check if an achievement is unlocked
   */
  isUnlocked(id: string): boolean {
    const achievement = this.getById(id);
    return achievement ? achievement.unlocked : false;
  }

  /**
   * Unlock an achievement
   */
  unlock(id: string): void {
    const achievement = this.getById(id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.dateUnlocked = new Date();
      // TODO: Trigger event for achievement unlocked
    }
  }

  /**
   * Evaluate all achievements to check which ones should be unlocked
   * based on their associated status and rule
   */
  evaluateAchievements(): void {
    this.achievements.forEach((achievement) => {
      if (!achievement.unlocked) {
        const status = this.statusRegistry.getStatus(achievement.statusId);
        const rule = this.getRuleById(achievement.ruleId);

        if (status && rule) {
          const shouldUnlock = rule.apply(status.value);
          if (shouldUnlock) {
            this.unlock(achievement.id);
          }
        }
      }
    });
  }

  /**
   * Get a rule by its id
   * Note: In a real implementation, this would come from a RuleRegistry
   */
  private getRuleById(id: string): Rule | undefined {
    // This is a placeholder. In a real implementation, you'd have a RuleRegistry
    // that you could query for rules.
    return undefined;
  }
}
