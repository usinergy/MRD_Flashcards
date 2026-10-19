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

interface WelcomeViewProps {
  masteredCount: number;
  totalCount: number;
  onStart: () => void;
  onSettings: () => void;
}

export function WelcomeView({masteredCount, totalCount, onStart, onSettings}: WelcomeViewProps) {
  return (
    <Page headerText="German Vocab" enableSystemBarInset={false}>
      <div className="action-page-shell">
        <ScrollView insetForHeader ariaLabel="Welcome content" tabIndex={0}>
          <Panel width="100%">
            <div className="content-inset">
              <div className="stats-summary-block">
                <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED} textColor={TextColor.ACCENT}>
                  Goethe Vocabulary Trainer
                </TextView>
                <TextView as="p" textStyle={TextStyle.BODY2}>
                  Frequency-ranked German study deck
                </TextView>
                <div className="stats-row">
                  <TextView as="span" textStyle={TextStyle.LABEL_EMPHASIZED}>
                    Mastered
                  </TextView>
                  <TextView as="span" textStyle={TextStyle.LABEL_EMPHASIZED} textColor={TextColor.ACCENT}>
                    {String(masteredCount)}
                  </TextView>
                </div>
                <div className="stats-row">
                  <TextView as="span" textStyle={TextStyle.LABEL}>
                    Total in Level
                  </TextView>
                  <TextView as="span" textStyle={TextStyle.LABEL} textColor={TextColor.SECONDARY}>
                    {String(totalCount)}
                  </TextView>
                </div>
                <ActionHint text="Wristband & IMU gestures active" />
              </div>
            </div>
          </Panel>
        </ScrollView>

        <div className="action-dock">
          <ButtonRail>
            <Button
              title="Start Learning"
              onClick={onStart}
            />
            <Button
              title="Settings"
              onClick={onSettings}
            />
          </ButtonRail>
        </div>
      </div>
    </Page>
  );
}
