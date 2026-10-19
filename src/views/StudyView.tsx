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
  Tag,
} from '@wearables-ui-toolkit/mrbd';
import {Flashcard} from '../data/vocabulary';
import {useSwipeGesture} from '../hooks/useSwipeGesture';

interface StudyViewProps {
  currentCard?: Flashcard;
  isFlipped: boolean;
  onLeft: () => void;
  onRight: () => void;
}

export function StudyView({currentCard, isFlipped, onLeft, onRight}: StudyViewProps) {
  const swipe = useSwipeGesture(onLeft, onRight);

  return (
    <Page headerText="German Vocab" enableSystemBarInset={false}>
      <div
        className="action-page-shell"
        style={{touchAction: 'pan-y'}}
        onPointerDown={swipe.onPointerDown}
        onPointerMove={swipe.onPointerMove}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerCancel}
      >
        <ScrollView insetForHeader ariaLabel="Flashcard content" tabIndex={0}>
          <Panel width="100%">
            <div className="content-inset">
              {!currentCard ? (
                <div className="stats-summary-block">
                  <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED} textColor={TextColor.ACCENT}>
                    Deck Mastered
                  </TextView>
                  <TextView as="p" textStyle={TextStyle.BODY2}>
                    All cards in this Goethe level are learned
                  </TextView>
                  <ActionHint text="Select Return to exit" />
                </div>
              ) : (
                <>
                  <div className="card-meta-row">
                    <div className="card-tag-group">
                      {currentCard.article ? (
                        <Tag text={currentCard.article} />
                      ) : (
                        <Tag text={currentCard.level} />
                      )}
                    </div>
                    <TextView as="span" textStyle={TextStyle.META1} textColor={TextColor.SECONDARY}>
                      {currentCard.category}
                    </TextView>
                  </div>

                  {!isFlipped ? (
                    <div className="card-center-block">
                      <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED} textColor={TextColor.PRIMARY}>
                        {currentCard.german}
                      </TextView>
                    </div>
                  ) : (
                    <div className="card-center-block">
                      <TextView as="p" textStyle={TextStyle.BODY2_EMPHASIZED} textColor={TextColor.ACCENT}>
                        {currentCard.english}
                      </TextView>
                      <div className="card-example-section">
                        <TextView as="p" textStyle={TextStyle.BODY2} textColor={TextColor.PRIMARY}>
                          {currentCard.exampleGerman}
                        </TextView>
                        <TextView as="p" textStyle={TextStyle.META1} textColor={TextColor.SECONDARY}>
                          {currentCard.exampleEnglish}
                        </TextView>
                      </div>
                    </div>
                  )}

                  <ActionHint
                    text={isFlipped ? "← Next · → Know It (Hand/IMU)" : "← Reveal · → Know It (Hand/IMU)"}
                  />
                </>
              )}
            </div>
          </Panel>
        </ScrollView>

        <div className="action-dock">
          <ButtonRail>
            <Button
              title={!currentCard ? "Return" : isFlipped ? "Next (←)" : "Reveal (←)"}
              onClick={onLeft}
            />
            <Button
              title={!currentCard ? "Restart" : "Know It (→)"}
              onClick={onRight}
            />
          </ButtonRail>
        </div>
      </div>
    </Page>
  );
}
