import get from 'lodash/get';
import sum from 'lodash/sum';
import mean from 'lodash/mean';
import map from 'lodash/map';
import {setProperty} from './helpers';

class BenchmarkMeasure {
  static start() {
    return new this().start();
  }

  get started_at() { return this._started_at / 1000 }
  get finished_at() { return this._finished_at / 1000 }
  get elapsed() { return this.finished_at - this.started_at }
  get elapsed_running() { return (Date.now() / 1000) - this.started_at }

  start() {
    this._started_at = Date.now();
    return this;
  }

  finish() {
    this._finished_at = Date.now();
    return this;
  }

  toObject() {
    return {
      started_at: this.started_at,
      finished_at: this.finished_at,
      elapsed: this.elapsed
    }
  }
}

export class Benchmark {
  static start(context) {
    if(!get(this, `history.${context}`)) {
      setProperty(this, `history.${context}`, []);
    }

    this.benchmarks[context] = BenchmarkMeasure.start();
  }

  static silence() { this._silence = true }
  static unsilence() { this._silence = false }
  static $get(context) { return get(this, `history.${context}`) }

  static stop(context) {
    if(!this.benchmarks[context]) { return }
    this.benchmarks[context].finish();
    if(!this._silence) { console.info(`Benchmark: ${context}`, `${this.benchmarks[context].elapsed} seconds`) }
    let history = get(this, `history.${context}`);
    let item = this.benchmarks[context].toObject();
    history.push(item);
    return item;
  }

  static clear() {
    this.benchmarks = {};
    this.history = {};
  }

  static total(context) {
    return sum(map(this.history[context], 'elapsed'));
  }

  static average(context) {
    return mean(map(this.history[context], 'elapsed'));
  }
}

Benchmark.benchmarks = {};
Benchmark.history = {};
