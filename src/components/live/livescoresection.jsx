import React from 'react';

function LiveScoreSection({ setActiveTab }) {
  return (
    <div className="section-title single-result" style={{ background: 'url(https://html.iwthemes.com/sportscup/run/img/locations/3.jpg)' }}>
      <div className="container">
        <div className="row">
          {/* Result Location */}
          <div className="col-lg-12">
            <div className="result-location">
              <ul>
                <li>Wed 26 Jun 2018</li>
                <li>
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  Saint Petersburg Stadium, Russia
                </li>
                <li>Att: 80,000</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="row">
          <div className="col-md-5 col-lg-5">
            <div className="team">
              <img src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/colombia.png" alt="club-logo" />
              <a href="single-team.html">Colombia</a>
              <ul>
                <li>
                  Jamez Rodriguez 12' <i className="fa fa-futbol-o" aria-hidden="true"></i>
                </li>
                <li>
                  Falcao Garcia 30' <i className="fa fa-futbol-o" aria-hidden="true"></i>
                </li>
                <li>
                  Juan Cuadrado 60' <i className="fa fa-futbol-o" aria-hidden="true"></i>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-2 col-lg-2">
            <div className="result-match">3 : 2</div>
            <div className="live-on">
              <a href="#stream" onClick={(e) => { e.preventDefault(); setActiveTab('stream'); }}>
                Live on
                <img src="https://html.iwthemes.com/sportscup/run/img/img-theme/espn.gif" alt="espn-logo" />
              </a>
            </div>
          </div>

          <div className="col-md-5 col-lg-5">
            <div className="team right">
              <a href="single-team.html">Argentina</a>
              <img src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/arg.png" alt="club-logo" />
              <ul>
                <li>
                  <i className="fa fa-futbol-o" aria-hidden="true"></i> Lionel Messi 22'
                </li>
                <li>
                  <i className="fa fa-futbol-o" aria-hidden="true"></i> Gonzalo Higuaín 50'
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="row">
          <div className="col-lg-12">
            <div className="timeline-result">
              <div className="team-timeline">
                <img src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/colombia.png" alt="club-logo" />
                <a href="single-team.html">Col</a>
              </div>
              <ul className="timeline">
                <li className="card-result bottom goal" style={{ left: '10%' }} title="Goal" data-content="10. James Rodriguez">10'</li>
                <li className="card-result top goal" style={{ left: '12%' }} title="Goal" data-content="10. James Rodriguez">12'</li>
                <li className="card-result top change" style={{ left: '20%' }} title="Player Change" data-content="10. James Rodriguez for 9. Falcao Garcia">20'</li>
                <li className="card-result top red" style={{ left: '31%' }} title="Yellow card" data-content="10. James Rodriguez">31'</li>
                <li className="card-result top goal" style={{ left: '40%' }} title="Goal" data-content="10. James Rodriguez">40'</li>
                <li className="card-result top yellow" style={{ left: '65%' }} title="Yellow card" data-content="10. James Rodriguez">65'</li>
                <li className="card-result bottom yellow" style={{ left: '50%' }} title="Yellow card" data-content="10. James Rodriguez">50'</li>
                <li className="card-result top red" style={{ left: '65%' }} title="Yellow card" data-content="10. James Rodriguez">65'</li>
                <li className="card-result bottom yellow" style={{ left: '80%' }} title="Yellow card" data-content="10. James Rodriguez">80'</li>
                <li className="card-result top goal" style={{ left: '90%' }} title="Goal" data-content="10. James Rodriguez">90'</li>
              </ul>
              <div className="team-timeline">
                <img src="https://html.iwthemes.com/sportscup/run/img/clubs-logos/arg.png" alt="club-logo" />
                <a href="single-team.html">Arg</a>
              </div>
            </div>
          </div>
        </div>
        {/* End Timeline */}
      </div>
    </div>
  );
}

export default LiveScoreSection;
