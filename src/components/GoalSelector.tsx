import React from 'react';
import { ExtractedGoal } from '../types/Student';

interface GoalSelectorProps {
  goals: ExtractedGoal[];
  selectedGoals: ExtractedGoal[];
  onGoalsChange: (goals: ExtractedGoal[]) => void;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({
  goals,
  selectedGoals,
  onGoalsChange
}) => {
  const handleGoalToggle = (goal: ExtractedGoal) => {
    const isSelected = selectedGoals.some(selected => 
      selected.goal === goal.goal && selected.baseline === goal.baseline
    );

    if (isSelected) {
      // Bug 14: Inefficient array filtering - could cause performance issues
      const newSelected = selectedGoals.filter(selected =>
        !(selected.goal === goal.goal && selected.baseline === goal.baseline)
      );
      onGoalsChange(newSelected);
    } else {
      onGoalsChange([...selectedGoals, goal]);
    }
  };

  const isGoalSelected = (goal: ExtractedGoal) => {
    return selectedGoals.some(selected => 
      selected.goal === goal.goal && selected.baseline === goal.baseline
    );
  };

  if (goals.length === 0) {
    return (
      <div className="no-goals">
        <p>No learning goals were extracted from the IEP document.</p>
        <p>Please check that the PDF contains properly formatted goals.</p>
      </div>
    );
  }

  return (
    <div className="goal-selector">
      <p>Found {goals.length} learning goals. Select the ones you want to add:</p>
      
      <div className="goals-list">
        {goals.map((goal, index) => (
          // Bug 15: Using array index as key instead of unique identifier
          <div key={index} className="goal-item">
            <label className="goal-checkbox">
              <input
                type="checkbox"
                checked={isGoalSelected(goal)}
                onChange={() => handleGoalToggle(goal)}
              />
              <div className="goal-content">
                <div className="goal-text">
                  <strong>Goal:</strong> {goal.goal}
                </div>
                <div className="baseline-text">
                  <strong>Baseline:</strong> {goal.baseline}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
      
      <div className="selection-summary">
        <p>{selectedGoals.length} of {goals.length} goals selected</p>
        
        {selectedGoals.length > 0 && (
          <div className="selected-goals-preview">
            <h4>Selected Goals:</h4>
            <ul>
              {selectedGoals.map((goal, index) => (
                // Bug 16: Another instance of using index as key
                <li key={index}>
                  {goal.goal.substring(0, 50)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalSelector;