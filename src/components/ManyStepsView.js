// @flow
//
// Copyright 2019 Ivan Sorokin.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { Component } from 'react'
import { KeyboardAvoidingView, View, Animated, Dimensions } from 'react-native'
import styled from 'styled-components/native'
import Header from 'components/Header'

import { Spacer, FlexGrow } from 'common'
import { Button } from 'components/CustomFont'
import { type Navigation, type Step } from 'common/types'

//Images
import CloseImg from 'assets/images/x.png'
import ChevronLeftImg from 'assets/images/ChevronLeft.png'

const Container = styled(KeyboardAvoidingView)`
  justify-content: flex-start;
  padding: 0 16px 0 16px;
  flex-grow: 1;
`

const Next = styled(Button)`
  width: 100%;
`

type Props = {
  steps: Array<Step>,
  navigation: Navigation,
  cancelAction: () => void,
  finalAction: () => void,
}

type State = {
  screenWidth: number,
  offsetX: Animated.Value,
  currentStep: number,
  nextStep: number,
}

class Send extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      offsetX: new Animated.Value(0),
      screenWidth: Dimensions.get('window').width,
      currentStep: 0,
      nextStep: 0,
    }
  }

  static navigationOptions = {
    header: null,
  }

  move = (delta: -1 | 1) => {
    const { currentStep, screenWidth } = this.state
    const nextStep = currentStep + delta
    if (nextStep < 0) {
      this.props.cancelAction()
    } else if (nextStep >= this.props.steps.length) {
      this.props.finalAction()
    } else {
      // Proceed to the next step
      this.setState({ nextStep })
      // During transition we show both current and next step
      Animated.timing(this.state.offsetX, {
        toValue: -nextStep * screenWidth,
        duration: 300,
      }).start(() => {
        // After transition finished current and next becoming the same
        this.setState({ currentStep: nextStep })
      })
    }
  }

  render() {
    const { offsetX, screenWidth, currentStep, nextStep } = this.state
    return (
      <React.Fragment>
        <FlexGrow>
          <Header
            leftIcon={(!nextStep && CloseImg) || ChevronLeftImg}
            leftText={!nextStep ? 'Cancel' : 'Back'}
            leftAction={() => this.move(-1)}
          />
          <Container behavior="padding">
            {/* Steps */}
            <View style={{ flex: 1 }}>
              {this.props.steps.map((step, i) => {
                const StepContainer = step.container
                return (
                  [currentStep, nextStep].indexOf(i) !== -1 && (
                    <Animated.View
                      key={i}
                      style={{
                        width: '100%',
                        top: 0,
                        position: 'absolute',
                        left: Animated.add(offsetX, screenWidth * i),
                      }}
                    >
                      <StepContainer />
                    </Animated.View>
                  )
                )
              })}
            </View>
            <Next
              title={nextStep === this.props.steps.length - 1 ? 'Send' : 'Next'}
              onPress={e => {
                if (this.props.steps[currentStep].onNextPress) {
                  this.props.steps[currentStep].onNextPress(e, () => {
                    this.move(1)
                  })
                } else {
                  this.move(1)
                }
              }}
              disabled={!this.props.steps[currentStep].validate()}
            />
            <Spacer />
          </Container>
        </FlexGrow>
      </React.Fragment>
    )
  }
}

export default Send
