import type { Statistics } from '../types';
import './StatisticsDisplay.css';

interface StatisticsDisplayProps {
    stats: Statistics;
}

export default function StatisticsDisplay({ stats }: StatisticsDisplayProps) {
    return (
        <div className="statistics-display">
            {/* 기본 통계 */}
            <StatSection title="📊 기본 통계">
                <div className="stat-grid">
                    <StatCard value={stats.totalMessages.toLocaleString()} label="총 메시지 수" />
                    <StatCard value={stats.totalParticipants.toString()} label="총 참여자 수" />
                </div>
            </StatSection>

            {/* 메시지 타입별 통계 */}
            <StatSection title="📝 메시지 타입별 통계">
                <div className="stat-grid">
                    <StatCard
                        value={stats.messageTypes.text.toLocaleString()}
                        label={`텍스트 (${((stats.messageTypes.text / stats.totalMessages) * 100).toFixed(1)}%)`}
                    />
                    <StatCard
                        value={stats.messageTypes.photo.toLocaleString()}
                        label={`사진 (${((stats.messageTypes.photo / stats.totalMessages) * 100).toFixed(1)}%)`}
                    />
                    <StatCard
                        value={stats.messageTypes.video.toLocaleString()}
                        label={`동영상 (${((stats.messageTypes.video / stats.totalMessages) * 100).toFixed(1)}%)`}
                    />
                    <StatCard
                        value={stats.messageTypes.emoji.toLocaleString()}
                        label={`이모티콘 (${((stats.messageTypes.emoji / stats.totalMessages) * 100).toFixed(1)}%)`}
                    />
                    <StatCard
                        value={stats.messageTypes.link.toLocaleString()}
                        label={`링크 (${((stats.messageTypes.link / stats.totalMessages) * 100).toFixed(1)}%)`}
                    />
                </div>
            </StatSection>

            {/* 상위 참여자 */}
            <StatSection title="👥 상위 참여자 (Top 20)">
                <RankTable
                    headers={['순위', '이름', '메시지 수', '비율']}
                    data={stats.topParticipants}
                    renderRow={(item, index) => (
                        <>
                            <td className="rank">{index + 1}</td>
                            <td className="name">{item.name}</td>
                            <td className="count">{item.count.toLocaleString()}개</td>
                            <td className="percentage">
                                {((item.count / stats.totalMessages) * 100).toFixed(1)}%
                            </td>
                        </>
                    )}
                />
            </StatSection>

            {/* 가장 많이 웃은 사람 */}
            <StatSection title="😂 가장 많이 웃은 사람 (Top 20)">
                <RankTable
                    headers={['순위', '이름', '횟수']}
                    data={stats.topLaughing}
                    renderRow={(item, index) => (
                        <>
                            <td className="rank">{index + 1}</td>
                            <td className="name">{item.name}</td>
                            <td className="count">{item.count.toLocaleString()}회</td>
                        </>
                    )}
                />
            </StatSection>

            {/* 가장 많이 운 사람 */}
            <StatSection title="😢 가장 많이 운 사람 (Top 20)">
                <RankTable
                    headers={['순위', '이름', '횟수']}
                    data={stats.topCrying}
                    renderRow={(item, index) => (
                        <>
                            <td className="rank">{index + 1}</td>
                            <td className="name">{item.name}</td>
                            <td className="count">{item.count.toLocaleString()}회</td>
                        </>
                    )}
                />
            </StatSection>

            {/* 골뱅이 태그 */}
            <StatSection title="🏷️ 골뱅이 태그로 가장 많이 언급된 사람 (Top 20)">
                <RankTable
                    headers={['순위', '이름', '횟수']}
                    data={stats.topMentioned}
                    renderRow={(item, index) => (
                        <>
                            <td className="rank">{index + 1}</td>
                            <td className="name">{item.name}</td>
                            <td className="count">{item.count.toLocaleString()}회</td>
                        </>
                    )}
                />
            </StatSection>

            {/* 연속 메시지 */}
            <StatSection title="💬 연속 메시지 최고 기록 (Top 20)">
                <p className="section-desc">
                    같은 사람이 5분 이내에 연속으로 보낸 메시지의 최대 개수입니다.
                </p>
                <RankTable
                    headers={['순위', '이름', '최대 연속']}
                    data={stats.spamParticipants}
                    renderRow={(item, index) => (
                        <>
                            <td className="rank">{index + 1}</td>
                            <td className="name">{item.name}</td>
                            <td className="count">{item.maxConsecutive.toLocaleString()}개</td>
                        </>
                    )}
                />
            </StatSection>

            {/* 대화 주도자와 종료자 */}
            <StatSection title="🎯 대화 주도자 & 종료자 (Top 20)">
                <div className="dual-table">
                    <div>
                        <h4 className="sub-title positive">🚀 대화 주도자</h4>
                        <p className="section-desc">
                            이전 메시지와 1시간 이상 간격이 있을 때 대화를 시작한 사람입니다.
                        </p>
                        <RankTable
                            headers={['순위', '이름', '시작 횟수']}
                            data={stats.conversationStarters}
                            renderRow={(item, index) => (
                                <>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{item.name}</td>
                                    <td className="count">{item.count.toLocaleString()}회</td>
                                </>
                            )}
                        />
                    </div>
                    <div>
                        <h4 className="sub-title warning">🏁 대화 종료자</h4>
                        <p className="section-desc">
                            메시지 후 1시간 동안 아무도 메시지를 보내지 않아 대화를 종료한 사람입니다.
                        </p>
                        <RankTable
                            headers={['순위', '이름', '종료 횟수']}
                            data={stats.conversationEnders}
                            renderRow={(item, index) => (
                                <>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{item.name}</td>
                                    <td className="count">{item.count.toLocaleString()}회</td>
                                </>
                            )}
                        />
                    </div>
                </div>
            </StatSection>

            {/* 감정/표현 분석 */}
            <StatSection title="😊 감정/표현 분석 (Top 20)">
                <div className="quad-table">
                    <div>
                        <h4 className="sub-title positive">✨ 긍정 표현</h4>
                        <RankTable
                            headers={['순위', '이름', '횟수']}
                            data={stats.emotionAnalysis.positive}
                            renderRow={(item, index) => (
                                <>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{item.name}</td>
                                    <td className="count">{item.count.toLocaleString()}회</td>
                                </>
                            )}
                        />
                    </div>
                    <div>
                        <h4 className="sub-title negative">😢 부정 표현</h4>
                        <RankTable
                            headers={['순위', '이름', '횟수']}
                            data={stats.emotionAnalysis.negative}
                            renderRow={(item, index) => (
                                <>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{item.name}</td>
                                    <td className="count">{item.count.toLocaleString()}회</td>
                                </>
                            )}
                        />
                    </div>
                    <div>
                        <h4 className="sub-title info">❓ 질문 표현</h4>
                        <RankTable
                            headers={['순위', '이름', '횟수']}
                            data={stats.emotionAnalysis.questions}
                            renderRow={(item, index) => (
                                <>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{item.name}</td>
                                    <td className="count">{item.count.toLocaleString()}회</td>
                                </>
                            )}
                        />
                    </div>
                    <div>
                        <h4 className="sub-title warning">🎉 감탄사</h4>
                        <RankTable
                            headers={['순위', '이름', '횟수']}
                            data={stats.emotionAnalysis.exclamations}
                            renderRow={(item, index) => (
                                <>
                                    <td className="rank">{index + 1}</td>
                                    <td className="name">{item.name}</td>
                                    <td className="count">{item.count.toLocaleString()}회</td>
                                </>
                            )}
                        />
                    </div>
                </div>
            </StatSection>

            {/* 시간대별 활동 패턴 */}
            <StatSection title="🕐 시간대별 활동 패턴">
                <RankTable
                    headers={['시간대', '메시지 수', '비율']}
                    data={stats.activityByTimeSlot}
                    renderRow={(item) => (
                        <>
                            <td className="name">{item.slot}</td>
                            <td className="count">{item.count.toLocaleString()}개</td>
                            <td className="count">{item.percentage.toFixed(1)}%</td>
                        </>
                    )}
                />
            </StatSection>

            {/* 대화 밀도 분석 */}
            <StatSection title="📅 대화 밀도 분석">
                <div className="stat-grid">
                    <StatCard
                        value={stats.conversationDensity.avgMessagesPerDay.toString()}
                        label="일평균 메시지"
                    />
                    <StatCard
                        value={stats.conversationDensity.activeDays.toString()}
                        label={`활동 일수 / ${stats.conversationDensity.totalDays}일`}
                    />
                    <StatCard
                        value={stats.conversationDensity.mostActiveDay.date}
                        label={`가장 활발한 날 (${stats.conversationDensity.mostActiveDay.count}개)`}
                    />
                    <StatCard
                        value={stats.conversationDensity.longestGap.days.toString()}
                        label="최장 공백 기간 (일)"
                    />
                </div>
            </StatSection>

            {/* 자주 사용된 단어 */}
            <StatSection title="📝 자주 사용된 단어 (Top 20)">
                <RankTable
                    headers={['순위', '단어', '횟수']}
                    data={stats.topWords}
                    renderRow={(item, index) => (
                        <>
                            <td className="rank">{index + 1}</td>
                            <td className="name">{item.word}</td>
                            <td className="count">{item.count.toLocaleString()}회</td>
                        </>
                    )}
                />
            </StatSection>

            {/* 새벽 활동가 */}
            <StatSection title="🌙 새벽 활동가 (Top 20)">
                <p className="section-desc">새벽 2시~5시 사이에 메시지를 보낸 횟수입니다.</p>
                <RankTable
                    headers={['순위', '이름', '횟수']}
                    data={stats.lateNightParticipants}
                    renderRow={(item, index) => (
                        <>
                            <td className="rank">{index + 1}</td>
                            <td className="name">{item.name}</td>
                            <td className="count">{item.count.toLocaleString()}회</td>
                        </>
                    )}
                />
            </StatSection>

            {/* 키워드 언급 */}
            {stats.keywordMentions.size > 0 && (
                <StatSection title="🔍 키워드 언급 통계">
                    <div className="keyword-grid">
                        {Array.from(stats.keywordMentions.entries()).map(([keyword, mentions]) => (
                            <div key={keyword} className="keyword-item">
                                <h4>"{keyword}" 키워드</h4>
                                <RankTable
                                    headers={['순위', '이름', '횟수']}
                                    data={mentions}
                                    renderRow={(item, index) => (
                                        <>
                                            <td className="rank">{index + 1}</td>
                                            <td className="name">{item.name}</td>
                                            <td className="count">{item.count.toLocaleString()}회</td>
                                        </>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                </StatSection>
            )}
        </div>
    );
}

// 하위 컴포넌트들
function StatSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="stat-section">
            <h2>{title}</h2>
            {children}
        </section>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="stat-card">
            <div className="value">{value}</div>
            <div className="label">{label}</div>
        </div>
    );
}

interface RankTableProps<T> {
    headers: string[];
    data: T[];
    renderRow: (item: T, index: number) => React.ReactNode;
}

function RankTable<T>({ headers, data, renderRow }: RankTableProps<T>) {
    if (data.length === 0) {
        return <p className="no-data">데이터가 없습니다.</p>;
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {headers.map((header, i) => (
                            <th key={i}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>{renderRow(item, index)}</tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
