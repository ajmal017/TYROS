import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { getRealTimePrice } from '../../utils/realTimePrice';
import { calcTotalGain } from '../../utils/calcTotalGain';
import { calcTodayGain } from '../../utils/calcTodayGain';
import { checkMarketOpened } from '../../utils/isMarketOpen';

const StockItem = ({
  stock,
  gainSelect
}) => {
  const [realTimePrice, setRealTimePrice] = useState({});
  const [todayGain, setTodayGain] = useState({});
  const [totalGain, setTotalGain] = useState({});
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const marketStatus = await checkMarketOpened();
      setIsMarketOpen(marketStatus);
    })();
  }, []);

  useEffect(() => {
    setRealTimePrice({ [stock.ticker]: '' });
    setTotalGain({ [stock.ticker]: '' });
    if (isFirstRender) {
      setIsFirstRender(false);
      (async () => {
        setRealTimePrice({
          ...realTimePrice,
          [stock.ticker]: await getRealTimePrice(stock.ticker)
        });
      })();
    }
    if (isMarketOpen) {
      const intervalId = setInterval(async () => {
        setRealTimePrice({
          ...realTimePrice,
          [stock.ticker]: await getRealTimePrice(stock.ticker)
        });
      }, 5000);
      return () => clearInterval(intervalId); // cleaning up when the user logged out
    }
  }, [stock, isMarketOpen]);

  useEffect(() => {
    if (!!realTimePrice[stock.ticker]) {
      (async () => {
        const todayGain = await calcTodayGain(stock.ticker, stock.quantity);
        setTodayGain({
          ...todayGain,
          [stock.ticker]: todayGain
        });
      })();
      setTotalGain({
        ...totalGain,
        [stock.ticker]: calcTotalGain(realTimePrice[stock.ticker], stock.avgCost, stock.quantity)
      });
    }
  }, [realTimePrice]);

  const stockInfo = (
    <React.Fragment>
      <div className="stock-item-ticker">
        {stock.ticker.toUpperCase()}
      </div>
      <div className="stock-item-realtime">{realTimePrice[stock.ticker]}</div>
      <div className="stock-item-avgCost">
        Avg.Cost: {stock.avgCost}
      </div>
      <div className="stock-item-quantity">
        Quantity: {stock.quantity}
      </div>
      <div className="stock-item-todayGain">Today: {todayGain[stock.ticker] && <React.Fragment>
        {todayGain[stock.ticker].change} ({todayGain[stock.ticker].changePercent})%
        </React.Fragment>}</div>
      <div className="stock-item-totalGain">Total: {totalGain[stock.ticker] && <React.Fragment>
        {totalGain[stock.ticker].totalGain} ({totalGain[stock.ticker].totalGainPercent})%
        </React.Fragment>}</div>
    </React.Fragment>
  );

  const renderColor = () => {
    if (gainSelect === 'todayGain') {
      if (todayGain[stock.ticker]) {
        if (todayGain[stock.ticker].change > 0) {
          return "stock-item gain-positive";
        } else if (todayGain[stock.ticker].change < 0) {
          return "stock-item gain-negative";
        } else {
          return "stock-item gain-zero";
        }
      }
    } else if (gainSelect === 'totalGain') {
      if (totalGain[stock.ticker]) {
        if (totalGain[stock.ticker].totalGain > 0) {
          return "stock-item gain-positive";
        } else if (totalGain[stock.ticker].totalGain < 0) {
          return "stock-item gain-negative";
        } else {
          return "stock-item gain-zero";
        }
      }
    }
  }

  return (
    stock.quantity > 0 ? (
      <div className={renderColor()}>
        {stockInfo}
      </div>
    ) : <div>is this?</div>
  );
}

StockItem.propTypes = {

}

export default StockItem;
