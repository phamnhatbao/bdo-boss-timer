import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { Subject, interval } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { BossService } from './core/data/boss.service';
import { ScheduleService } from './core/data/schedule.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any>;
  private schedule: any;
  private alertList: Array<string> = [];

  title = 'boss-timer';

  public countdown: any;
  public bossList: any;
  public boss: any;

  constructor(
    private ref: ChangeDetectorRef,
    private bossService: BossService,
    private scheduleService: ScheduleService,
  ) {
    this.countdown = {
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    this.bossService.getAll().subscribe(val => {
      this.boss = val;
    });

    this.scheduleService.getAll().subscribe(val => {
      this.schedule = val;
    });

    this.unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    const countDown = interval(1000)
      .pipe(
        map(value => {
          return this._secondsToRemaining(value);
        })
      );

    // Subscribe to the countdown interval
    countDown
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(value => {
        this.countdown = value.countdown;
        this.bossList = value.boss;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  onCbTimeChange(event) {
    if (event.target.checked) {
      this.alertList.push(event.target.value);
    } else {
      const index = this.alertList.indexOf(event.target.value);
      this.alertList.splice(index, 1);
    }
  }

  private showNotification() {
    if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      const notification = new Notification('Black Desert Boss', {
        body: 'Boss Time Incomming'
      });
    } else if (Notification.permission !== 'denied') { // Otherwise, we need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === 'granted') {
          const notification = new Notification('Black Desert Boss', {
            body: 'Boss Time Incomming'
          });
        }
      });
    }
  }

  private _secondsToRemaining(value) {
    const current = moment();
    const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    let schedule = this.schedule[weekDays[current.day()]];

    if (this.calcRemainingTime(current, schedule)) {
      return this.calcRemainingTime(current, schedule);
    }

    schedule = this.schedule[weekDays[current.day() + 1]];
    return this.calcRemainingTime(current, schedule);
  }

  private calcRemainingTime(current, schedule) {
    for (const key in schedule) {
      if (Object.prototype.hasOwnProperty.call(schedule, key)) {
        const diffWeek = current.week() - moment(key).week();
        const tempVal = moment(key).add(diffWeek * 7, 'd');

        if (current.isBefore(moment(tempVal)) && schedule[key].length > 0) {
          const diff = moment(tempVal).diff(current, 'seconds');
          const timeLeft = moment.duration(diff, 'seconds');

          if (this.alertList.indexOf(diff.toString()) > -1) {
            this.showNotification();
          }

          return {
            countdown: {
              hours: timeLeft.hours(),
              minutes: timeLeft.minutes(),
              seconds: timeLeft.seconds()
            },
            boss: schedule[key]
          };
        }
      }
    }
  }
}
