/**
 * Light-weight Browser Agent & Execution Core
 * Translates user intent into grounded visual action sequences.
 */

export class BrowserAgent {
  constructor() {
    this.history = [];
    this.isExecuting = false;
  }

  /**
   * Evaluates task prompt against perceived interactive marks
   * @param {string} goal 
   * @param {Array<Object>} marks 
   * @returns {Object} Action plan
   */
  planAction(goal, marks) {
    const lowerGoal = goal.toLowerCase();

    // 1. Check for search / type intent
    if (lowerGoal.includes('search') || lowerGoal.includes('type') || lowerGoal.includes('enter')) {
      const inputMark = marks.find(m => m.tagName === 'input' || m.tagName === 'textarea' || m.type === 'search');
      if (inputMark) {
        const queryMatch = lowerGoal.match(/(?:for|type|search)\s+["']?([^"']+)["']?/i);
        const queryText = queryMatch ? queryMatch[1] : goal.replace(/search|type|enter|for/gi, '').trim();

        return {
          action: 'type',
          targetMarkId: inputMark.id,
          value: queryText,
          description: `Type "${queryText}" into Input Mark #${inputMark.id}`
        };
      }
    }

    // 2. Check for click intent matching element text
    const words = lowerGoal.replace(/click|press|select|open|go to/gi, '').trim().split(/\s+/);
    for (const word of words) {
      if (word.length < 3) continue;
      const targetMark = marks.find(m => m.text.toLowerCase().includes(word));
      if (targetMark) {
        return {
          action: 'click',
          targetMarkId: targetMark.id,
          description: `Click Mark #${targetMark.id} ("${targetMark.text}")`
        };
      }
    }

    // Default fallback to first clickable action
    if (marks.length > 0) {
      return {
        action: 'click',
        targetMarkId: marks[0].id,
        description: `Click Mark #${marks[0].id} ("${marks[0].text}")`
      };
    }

    return {
      action: 'idle',
      targetMarkId: null,
      description: 'No matching interactive target found on page.'
    };
  }

  /**
   * Executes plan action on page DOM
   * @param {Object} plan 
   * @param {Array<Object>} marks 
   */
  executeAction(plan, marks) {
    if (!plan || plan.action === 'idle') return { success: false, log: plan.description };

    const targetMark = marks.find(m => m.id === plan.targetMarkId);
    if (!targetMark || !targetMark.elementRef) {
      return { success: false, log: `Mark #${plan.targetMarkId} element reference not found.` };
    }

    const el = targetMark.elementRef;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (plan.action === 'click') {
      el.focus();
      el.click();
      return { success: true, log: `Successfully clicked Mark #${plan.targetMarkId}` };
    } else if (plan.action === 'type') {
      el.focus();
      el.value = plan.value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return { success: true, log: `Successfully typed "${plan.value}" into Mark #${plan.targetMarkId}` };
    }

    return { success: false, log: `Unknown action type: ${plan.action}` };
  }
}
