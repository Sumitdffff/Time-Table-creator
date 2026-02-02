import React, { PureComponent } from "react";
import { FormGroup, FormLabel, FormControl } from "material-ui/Form";
import { createStyleSheet, withStyles } from "material-ui/styles";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";
import Typography from "material-ui/Typography";
import PropTypes from "prop-types";

import "./timetabel.css";
import base from "../../re-base";
import { emptyStarterTimeTable } from "../../constants";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

const PERIODS = [
  { id: "sl1", label: "9:30-10:30\n" },
  { id: "sl2", label: "10:30-11:30\n" },
  { id: "sl3", label: "11:30-12:30\n" },
  { id: "sl4", label: "12:30-1:30\n" },
  { id: "break", label: "1:30-2:00" },
  { id: "sl5", label: "2:00-3:00\n" },
  { id: "sl6", label: "3:00-4:00\n" },
  { id: "sl7", label: "4:00-5:00\n" },
];

class AddTimeTable extends PureComponent {
  state = {
    data: emptyStarterTimeTable,
    classInfo: "",
    semester: "",
    shift: "",
    teachers: [],
    rooms: [],
  };

  componentDidMount() {
    base.fetch("teachers", { context: this, asArray: true }).then((data) =>
      this.setState({ teachers: data || [] })
    );

    base.fetch("rooms", { context: this, asArray: true }).then((data) =>
      this.setState({ rooms: data || [] })
    );
  }

  // ✅ SAVE FUNCTION (YEHI MISSING THA)
 pushTimeTableInfo = (e) => {
  // REMOVE e.preventDefault(); so form submission reloads page

  const payload = {
    classInfo: this.state.classInfo,
    semester: this.state.semester,
    shift: this.state.shift,
    data: this.state.data,
  };

  const key = Date.now();

  base.post(`timeTables/${key}`, {
    data: payload,
    then: (err) => {
      if (!err) {
        alert("Timetable saved successfully ✅");
        // Optional: you can force reload manually if you want
        // window.location.reload();
      }
    },
  });
};

  renderEditable = (rowIndex, periodId) => {
    const value = this.state.data[rowIndex][periodId];

    return (
      <div className="cell">
        <input
          placeholder="Subject"
          value={value[0]}
          onChange={(e) => {
            const data = [...this.state.data];
            data[rowIndex][periodId][0] = e.target.value;
            this.setState({ data });
          }}
        />

        <select
          value={value[1]}
          onChange={(e) => {
            const data = [...this.state.data];
            data[rowIndex][periodId][1] = e.target.value;
            this.setState({ data });
          }}
        >
          <option>Not Set</option>
          {this.state.teachers.map((t) => (
            <option key={t.name}>{t.name}</option>
          ))}
        </select>

        <select
          value={value[2]}
          onChange={(e) => {
            const data = [...this.state.data];
            data[rowIndex][periodId][2] = e.target.value;
            this.setState({ data });
          }}
        >
          <option>Not Set</option>
          {this.state.rooms.map((r) => (
            <option key={r.name}>{r.name}</option>
          ))}
        </select>
      </div>
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <form className={classes.form} onSubmit={this.pushTimeTableInfo}>
        <Typography type="display2">TIMETABLE INFORMATION</Typography>

        <FormGroup>
          <FormControl>
            <TextField
              label="Class"
              required
              value={this.state.classInfo}
              onChange={(e) =>
                this.setState({ classInfo: e.target.value })
              }
            />
            <TextField
              label="Semester"
              required
              value={this.state.semester}
              onChange={(e) =>
                this.setState({ semester: e.target.value })
              }
            />
            <TextField
              label="Shift"
              required
              value={this.state.shift}
              onChange={(e) =>
                this.setState({ shift: e.target.value })
              }
            />
          </FormControl>
        </FormGroup>

        <table className="timetable">
          <thead>
            <tr>
              <th>DAY</th>
              {PERIODS.map((p) => (
                <th key={p.id}>
                  {p.label.split("\n")[0]} <br />
                  <small>{p.label.split("\n")[1]}</small>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map((day, rowIndex) => (
              <tr key={day}>
                <td className="day">{day}</td>

                {PERIODS.map((p) =>
                  p.id === "break" ? (
                    <td key="break" className="break">LUNCH</td>
                  ) : (
                    <td key={p.id}>
                      {this.renderEditable(rowIndex, p.id)}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <Button raised color="primary" type="submit" className={classes.button}>
          Save
        </Button>
      </form>
    );
  }
}

const styleSheet = createStyleSheet({
  form: { margin: 40 },
  button: { marginTop: 30 },
});

AddTimeTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(AddTimeTable);
