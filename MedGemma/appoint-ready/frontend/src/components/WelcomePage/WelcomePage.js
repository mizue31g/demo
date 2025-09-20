/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import './WelcomePage.css';

const WelcomePage = ({ onSwitchPage }) => {
  return (
    <div className="welcome page">
      <img src="/assets/medgemma.avif" alt="MedGemma Logo" className="medgemma-logo" />
      <div className="info-page-container">
        <div className="graphics">
          <img className="graphics-top" src="/assets/welcome_top_graphics.svg" alt="Welcome top graphics" />
          <img className="graphics-bottom" src="/assets/welcome_bottom_graphics.svg" alt="Welcome bottom graphics" />
        </div>
        <div className="info-content">
          <div className="info-header">
            <span className="title-header">Simulated Pre-visit Intake Demo</span>
          </div>
          <div className="info-text">
          医療従事者は、診察前に患者情報を収集する必要があることがよくあります。
          このデモでは、MedGemma をアプリケーションでどのように使用して、診察前の情報収集と活用を効率化できるかを示します。 
            <br /><br/>
            まず、MedGemma で構築された診察前 AI エージェントが質問をして情報を収集します。
            関連情報を特定し収集した後、デモアプリケーションは診察前レポートを生成します。
            <br /><br/>
            この種のインテリジェントな診察前レポートは、従来の問診票と比較して、医療従事者がより効率的かつ効果的になるのに役立つだけでなく、患者にとっても改善された体験を提供します。
            <br /><br/>
            最後に、出力の品質に関する洞察を提供する診察前レポートの評価を表示できます。
            この評価のために、MedGemma には参照診断が提供され、長所と改善点の両方を強調する「自己評価」が可能になります。
          </div>
          <div className="info-disclaimer-text">
            <span className="info-disclaimer-title">Disclaimer</span> This
            demonstration is for illustrative purposes only and does not represent a finished or approved
            product. It is not representative of compliance to any regulations or standards for
            quality, safety or efficacy. Any real-world application would require additional development,
            training, and adaptation. The experience highlighted in this demo shows MedGemma's baseline
            capability for the displayed task and is intended to help developers and users explore possible
            applications and inspire further development.
          </div>
          <button className="info-button" onClick={onSwitchPage}>Select Patient</button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
