import {
  Button,
  ButtonRail,
  Page,
  Panel,
  ScrollView,
  TextStyle,
  TextView,
  TextColor,
  ActionHint,
} from '@wearables-ui-toolkit/mrbd';

interface SettingsViewProps {
  difficultyLabel: string;
  masteredCount: number;
  onCycleLevel: () => void;
  onReset: () => void;
  onClose: () => void;
}

export function SettingsView({difficultyLabel, masteredCount, onCycleLevel, onReset, onClose}: SettingsViewProps) {
  return (
    <Page headerText="App Settings" enableSystemBarInset={false}>
      <div className="action-page-shell">
        <ScrollView insetForHeader ariaLabel="Settings content" tabIndex={0}>
          <Panel width="100%">
            <div className="content-inset">
              <div className="stats-summary-block">
                <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED} textColor={TextColor.PRIMARY}>
                  Exam Level
                </TextView>
                <div className="stats-row">
                  <TextView as="span" textStyle={TextStyle.LABEL_EMPHASIZED}>
                    Difficulty
                  </TextView>
                  <TextView as="span" textStyle={TextStyle.LABEL_EMPHASIZED} textColor={TextColor.ACCENT}>
                    {difficultyLabel}
                  </TextView>
                </div>
                <div className="stats-row">
                  <TextView as="span" textStyle={TextStyle.LABEL}>
                    Mastered Words
                  </TextView>
                  <TextView as="span" textStyle={TextStyle.LABEL} textColor={TextColor.SECONDARY}>
                    {String(masteredCount)}
                  </TextView>
                </div>
                <div className="stats-row">
                  <TextView as="span" textStyle={TextStyle.LABEL}>
                    Hand / IMU Gesture
                  </TextView>
                  <TextView as="span" textStyle={TextStyle.LABEL_EMPHASIZED} textColor={TextColor.ACCENT}>
                    Enabled
                  </TextView>
                </div>
                <ActionHint text="Left: Change Level · Right: Reset Progress" />
              </div>
            </div>
          </Panel>
        </ScrollView>

        <div className="action-dock">
          <ButtonRail>
            <Button
              title="Change Level"
              onClick={onCycleLevel}
            />
            <Button
              title="Reset Progress"
              onClick={onReset}
            />
            <Button
              title="Close"
              onClick={onClose}
            />
          </ButtonRail>
        </div>
      </div>
    </Page>
  );
}
